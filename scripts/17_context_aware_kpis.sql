-- Context-Aware KPI Functions for Admin Dashboard
-- This script creates separate KPI functions for Applicants and Users tabs

-- Function to get applicants-specific KPIs
CREATE OR REPLACE FUNCTION get_applicants_kpis()
RETURNS TABLE (
  new_applicants INTEGER,
  rejected_applicants INTEGER,
  approved_this_week INTEGER,
  active_users_today INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  week_ago DATE := CURRENT_DATE - INTERVAL '7 days';
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  RETURN QUERY
  SELECT 
    -- New applicants (status = 'new', accumulates until reviewed)
    COUNT(*) FILTER (WHERE status = 'new')::INTEGER as new_applicants,
    
    -- Rejected applicants (status = 'rejected', all time)
    COUNT(*) FILTER (WHERE status = 'rejected')::INTEGER as rejected_applicants,
    
    -- Approved this week (status = 'approved' AND created in last 7 days)
    COUNT(*) FILTER (WHERE status = 'approved' AND DATE(created_at) >= week_ago)::INTEGER as approved_this_week,
    
    -- Active users today (users who completed weigh-in today)
    (SELECT COUNT(DISTINCT user_id)::INTEGER 
     FROM weight_entries 
     WHERE DATE(recorded_at) = CURRENT_DATE) as active_users_today
  FROM nutritionist_applications;
END;
$$;

-- Function to get users-specific KPIs
CREATE OR REPLACE FUNCTION get_users_kpis()
RETURNS TABLE (
  new_users_this_week INTEGER,
  users_in_progress INTEGER,
  completed_this_week INTEGER,
  active_users_today INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  week_ago DATE := CURRENT_DATE - INTERVAL '7 days';
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  RETURN QUERY
  SELECT 
    -- New users this week (users who started challenge in last 7 days)
    COUNT(DISTINCT uc.user_id) FILTER (WHERE DATE(uc.start_date) >= week_ago)::INTEGER as new_users_this_week,
    
    -- Users in progress (active challenges with < 7 weigh-ins)
    COUNT(DISTINCT uc.user_id) FILTER (WHERE uc.status = 'active' AND (uc.user_id IN (
      SELECT user_id FROM weight_entries GROUP BY user_id HAVING COUNT(*) < 7
    )))::INTEGER as users_in_progress,
    
    -- Completed this week (users with 7+ weigh-ins in last 7 days)
    COUNT(DISTINCT uc.user_id) FILTER (WHERE uc.user_id IN (
      SELECT user_id FROM weight_entries 
      GROUP BY user_id 
      HAVING COUNT(*) >= 7 AND MAX(DATE(recorded_at)) >= week_ago
    ))::INTEGER as completed_this_week,
    
    -- Active users today (users who completed weigh-in today)
    COUNT(DISTINCT we.user_id) FILTER (WHERE DATE(we.recorded_at) = CURRENT_DATE)::INTEGER as active_users_today
  FROM user_challenges uc
  LEFT JOIN weight_entries we ON uc.user_id = we.user_id;
END;
$$;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_applicants_kpis() TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_kpis() TO authenticated;

-- Test the functions (uncomment to test)
-- SELECT * FROM get_applicants_kpis();
-- SELECT * FROM get_users_kpis();
