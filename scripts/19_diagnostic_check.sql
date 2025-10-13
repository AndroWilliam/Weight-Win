-- ============================================================================
-- DIAGNOSTIC SCRIPT - Check Database State
-- Run this to see what's actually in your database
-- ============================================================================

-- 1. Check what columns exist in weight_entries table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'weight_entries'
ORDER BY ordinal_position;

-- 2. Check constraints on weight_entries
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name = 'weight_entries';

-- 3. Check if user_milestones table exists and its structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_milestones'
ORDER BY ordinal_position;

-- 4. Check milestone_badges table
SELECT * FROM public.milestone_badges ORDER BY milestone_day;

-- 5. Check the record_daily_weight_checkin function signature
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'record_daily_weight_checkin';

-- 6. Sample weight_entries data (if any exists)
SELECT 
  id,
  user_id,
  weight_kg,
  recorded_at,
  check_in_date,
  day_number
FROM public.weight_entries
ORDER BY recorded_at DESC
LIMIT 5;

-- 7. Check RLS policies on weight_entries
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'weight_entries';

