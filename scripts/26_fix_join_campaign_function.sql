-- Fix join_campaign function to match actual campaign_participants table schema
-- The table does NOT have a required_days column

DROP FUNCTION IF EXISTS join_campaign(UUID, UUID);

CREATE OR REPLACE FUNCTION join_campaign(
  p_campaign_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
  
  -- Check campaign exists and is active
  IF NOT EXISTS (
    SELECT 1 
    FROM campaigns 
    WHERE id = p_campaign_id
    AND status = 'active'
    AND start_date <= NOW()
    AND end_date >= NOW()
  ) THEN
    RAISE EXCEPTION 'Campaign not found or not active';
  END IF;
  
  -- Check campaign capacity (if set)
  DECLARE
    v_capacity INTEGER;
    v_current_participants INTEGER;
    v_allow_multiple BOOLEAN;
  BEGIN
    SELECT capacity, allow_multiple_participation 
    INTO v_capacity, v_allow_multiple
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
  
  -- Create participation record with actual table columns
  INSERT INTO campaign_participants (
    campaign_id,
    user_id,
    started_at,
    status,
    days_completed,
    current_streak,
    reward_claimed,
    created_at,
    updated_at
  ) VALUES (
    p_campaign_id,
    p_user_id,
    NOW(),
    'active',
    0,
    0,
    false,
    NOW(),
    NOW()
  );
  
  -- Increment challenge_starts counter
  UPDATE campaigns
  SET challenge_starts = challenge_starts + 1
  WHERE id = p_campaign_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION join_campaign(UUID, UUID) TO authenticated;

-- Test comment
-- SELECT join_campaign('campaign-id', 'user-id');

