-- Dynamic KPI Functions for Admin Dashboard
-- This script creates functions to calculate real-time KPI data for the admin dashboard

-- Function to get nutritionist application KPIs
CREATE OR REPLACE FUNCTION get_nutritionist_kpis()
RETURNS TABLE (
  new_applicants INTEGER,
  in_review INTEGER,
  approved_this_week INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  week_ago DATE := CURRENT_DATE - INTERVAL '7 days';
BEGIN
  RETURN QUERY
  SELECT 
    -- New applicants (pending or new status)
    COUNT(*) FILTER (WHERE status IN ('pending', 'new'))::INTEGER as new_applicants,
    
    -- In review (reviewing or in_review status)
    COUNT(*) FILTER (WHERE status IN ('reviewing', 'in_review'))::INTEGER as in_review,
    
    -- Approved this week
    COUNT(*) FILTER (WHERE status = 'approved' AND DATE(created_at) >= week_ago)::INTEGER as approved_this_week
  FROM nutritionist_applications;
END;
$$;

-- Function to get user activity KPIs
CREATE OR REPLACE FUNCTION get_user_activity_kpis()
RETURNS TABLE (
  active_users_today INTEGER,
  new_users_this_week INTEGER,
  completed_challenges_this_week INTEGER,
  total_active_users INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  week_ago DATE := CURRENT_DATE - INTERVAL '7 days';
  today_start TIMESTAMP := CURRENT_DATE;
  today_end TIMESTAMP := CURRENT_DATE + INTERVAL '1 day';
BEGIN
  RETURN QUERY
  SELECT 
    -- Active users today (users who weighed in today)
    COUNT(DISTINCT we.user_id) FILTER (WHERE DATE(we.recorded_at) = CURRENT_DATE)::INTEGER as active_users_today,
    
    -- New users this week (users who started their first challenge this week)
    COUNT(DISTINCT uc.user_id) FILTER (WHERE DATE(uc.start_date) >= week_ago)::INTEGER as new_users_this_week,
    
    -- Completed challenges this week
    COUNT(DISTINCT cc.user_id) FILTER (WHERE DATE(cc.completed_at) >= week_ago)::INTEGER as completed_challenges_this_week,
    
    -- Total active users (users with active challenges)
    COUNT(DISTINCT uc.user_id) FILTER (WHERE uc.status = 'active')::INTEGER as total_active_users
  FROM user_challenges uc
  LEFT JOIN weight_entries we ON uc.user_id = we.user_id
  LEFT JOIN challenge_completions cc ON uc.user_id = cc.user_id;
END;
$$;

-- Function to get comprehensive admin KPIs
CREATE OR REPLACE FUNCTION get_admin_kpis()
RETURNS TABLE (
  new_applicants INTEGER,
  in_review INTEGER,
  approved_this_week INTEGER,
  active_users_today INTEGER,
  new_users_this_week INTEGER,
  completed_challenges_this_week INTEGER,
  total_active_users INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  week_ago DATE := CURRENT_DATE - INTERVAL '7 days';
BEGIN
  RETURN QUERY
  SELECT 
    -- Nutritionist application KPIs
    (SELECT new_applicants FROM get_nutritionist_kpis()) as new_applicants,
    (SELECT in_review FROM get_nutritionist_kpis()) as in_review,
    (SELECT approved_this_week FROM get_nutritionist_kpis()) as approved_this_week,
    
    -- User activity KPIs
    (SELECT active_users_today FROM get_user_activity_kpis()) as active_users_today,
    (SELECT new_users_this_week FROM get_user_activity_kpis()) as new_users_this_week,
    (SELECT completed_challenges_this_week FROM get_user_activity_kpis()) as completed_challenges_this_week,
    (SELECT total_active_users FROM get_user_activity_kpis()) as total_active_users;
END;
$$;

-- Create a view for easy access to admin KPIs
CREATE OR REPLACE VIEW admin_kpi_summary AS
SELECT * FROM get_admin_kpis();

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_nutritionist_kpis() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_activity_kpis() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_kpis() TO authenticated;
GRANT SELECT ON admin_kpi_summary TO authenticated;

-- Add RLS policies for admin-only access
CREATE POLICY "Only admins can view admin KPIs" ON admin_kpi_summary
  FOR SELECT TO authenticated
  USING (is_admin());

-- Test the functions
-- SELECT * FROM get_nutritionist_kpis();
-- SELECT * FROM get_user_activity_kpis();
-- SELECT * FROM get_admin_kpis();
-- SELECT * FROM admin_kpi_summary;
