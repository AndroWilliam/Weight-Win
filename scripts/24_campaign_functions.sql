-- Campaign RPC Functions
-- Functions for frontend campaign integration

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS get_active_campaigns();
DROP FUNCTION IF EXISTS track_campaign_click(UUID, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS join_campaign(UUID, UUID);
DROP FUNCTION IF EXISTS can_user_join_campaign(UUID, UUID);

-- 1. Get active campaigns with partner info
CREATE OR REPLACE FUNCTION get_active_campaigns()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slug VARCHAR,
  partner_id UUID,
  reward_type VARCHAR,
  discount_percentage INTEGER,
  reward_description TEXT,
  required_days INTEGER,
  require_phone BOOLEAN,
  reuse_phone BOOLEAN,
  banner_heading VARCHAR,
  banner_body TEXT,
  cta_text VARCHAR,
  banner_logo_url TEXT,
  banner_bg_url TEXT,
  primary_color VARCHAR,
  secondary_color VARCHAR,
  status VARCHAR,
  partner JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.partner_id,
    c.reward_type,
    c.discount_percentage,
    c.reward_description,
    c.required_days,
    c.require_phone,
    c.reuse_phone,
    c.banner_heading,
    c.banner_body,
    c.cta_text,
    c.banner_logo_url,
    c.banner_bg_url,
    c.primary_color,
    c.secondary_color,
    c.status,
    jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'logo_url', p.logo_url
    ) as partner
  FROM campaigns c
  INNER JOIN partners p ON c.partner_id = p.id
  WHERE c.status = 'active'
    AND c.start_date <= NOW()
    AND c.end_date >= NOW()
  ORDER BY c.priority DESC, c.created_at DESC;
END;
$$;

-- 2. Track campaign banner click
CREATE OR REPLACE FUNCTION track_campaign_click(
  p_campaign_id UUID,
  p_user_id UUID,
  p_user_agent TEXT,
  p_referrer TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Increment banner_clicks counter
  UPDATE campaigns
  SET banner_clicks = banner_clicks + 1
  WHERE id = p_campaign_id;
END;
$$;

-- 3. Join campaign (create participation record)
CREATE OR REPLACE FUNCTION join_campaign(
  p_campaign_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_required_days INTEGER;
BEGIN
  -- Get campaign required days
  SELECT required_days INTO v_required_days
  FROM campaigns
  WHERE id = p_campaign_id;
  
  IF v_required_days IS NULL THEN
    RAISE EXCEPTION 'Campaign not found';
  END IF;
  
  -- Check if user already participating
  IF EXISTS (
    SELECT 1 
    FROM campaign_participants 
    WHERE campaign_id = p_campaign_id 
    AND user_id = p_user_id
    AND status IN ('active', 'completed')
  ) THEN
    RAISE EXCEPTION 'User already participating in this campaign';
  END IF;
  
  -- Check campaign capacity
  DECLARE
    v_capacity INTEGER;
    v_current_participants INTEGER;
  BEGIN
    SELECT capacity INTO v_capacity
    FROM campaigns
    WHERE id = p_campaign_id;
    
    IF v_capacity IS NOT NULL THEN
      SELECT COUNT(*) INTO v_current_participants
      FROM campaign_participants
      WHERE campaign_id = p_campaign_id
      AND status IN ('active', 'completed');
      
      IF v_current_participants >= v_capacity THEN
        RAISE EXCEPTION 'Campaign is at full capacity';
      END IF;
    END IF;
  END;
  
  -- Create participation record
  INSERT INTO campaign_participants (
    campaign_id,
    user_id,
    required_days,
    status,
    started_at
  ) VALUES (
    p_campaign_id,
    p_user_id,
    v_required_days,
    'active',
    NOW()
  );
  
  -- Increment challenge_starts counter
  UPDATE campaigns
  SET challenge_starts = challenge_starts + 1
  WHERE id = p_campaign_id;
END;
$$;

-- 4. Check if user can join campaign
CREATE OR REPLACE FUNCTION can_user_join_campaign(
  p_campaign_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_capacity INTEGER;
  v_current_participants INTEGER;
  v_allow_multiple BOOLEAN;
BEGIN
  -- Check if campaign exists and is active
  IF NOT EXISTS (
    SELECT 1 
    FROM campaigns 
    WHERE id = p_campaign_id 
    AND status = 'active'
    AND start_date <= NOW()
    AND end_date >= NOW()
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Get campaign settings
  SELECT capacity, allow_multiple_participation
  INTO v_capacity, v_allow_multiple
  FROM campaigns
  WHERE id = p_campaign_id;
  
  -- Check capacity
  IF v_capacity IS NOT NULL THEN
    SELECT COUNT(*) INTO v_current_participants
    FROM campaign_participants
    WHERE campaign_id = p_campaign_id
    AND status IN ('active', 'completed');
    
    IF v_current_participants >= v_capacity THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Check if user already participating (unless multiple allowed)
  IF NOT v_allow_multiple THEN
    IF EXISTS (
      SELECT 1 
      FROM campaign_participants 
      WHERE campaign_id = p_campaign_id 
      AND user_id = p_user_id
      AND status IN ('active', 'completed')
    ) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_active_campaigns() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION track_campaign_click(UUID, UUID, TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION join_campaign(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_join_campaign(UUID, UUID) TO authenticated, anon;

-- Test queries
-- SELECT * FROM get_active_campaigns();
-- SELECT track_campaign_click('campaign-id', 'user-id');
-- SELECT join_campaign('campaign-id', 'user-id');
-- SELECT can_user_join_campaign('campaign-id', 'user-id');

