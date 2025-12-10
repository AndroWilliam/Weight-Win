-- =====================================================
-- Script: 27_campaign_participants_with_emails.sql
-- Description: Create function to get campaign participants with emails
-- Purpose: Phase 4 - Show participant emails in admin analytics
-- Date: 2025-12-10
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_campaign_participants_with_emails(UUID);

-- Create function to get participants with emails from auth.users
-- This function uses SECURITY DEFINER to bypass RLS and access auth.users
CREATE OR REPLACE FUNCTION get_campaign_participants_with_emails(p_campaign_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  user_deleted BOOLEAN,
  campaign_id UUID,
  status TEXT,
  days_completed INTEGER,
  current_streak INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  phone_number TEXT,
  reward_claimed BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.user_id,
    au.email::text as user_email,  -- Cast to TEXT for type compatibility
    (au.id IS NULL) as user_deleted,
    cp.campaign_id,
    cp.status::text,  -- Cast to TEXT for type compatibility
    cp.days_completed,
    cp.current_streak,
    cp.started_at,
    cp.completed_at,
    cp.phone_number::text,  -- Cast to TEXT for type compatibility
    cp.reward_claimed,
    cp.created_at,
    cp.updated_at
  FROM campaign_participants cp
  LEFT JOIN auth.users au ON cp.user_id = au.id
  WHERE cp.campaign_id = p_campaign_id
  ORDER BY cp.started_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_campaign_participants_with_emails(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_campaign_participants_with_emails(UUID) IS
'Returns campaign participants with email addresses from auth.users.
Sets user_deleted=true for accounts that have been deleted.
Used by admin analytics to show participant emails.';
