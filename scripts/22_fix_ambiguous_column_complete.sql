-- ============================================================================
-- COMPLETE FIX: Ambiguous Column Reference + RLS Issues
-- ============================================================================
-- This script fixes:
-- 1. "column reference 'current_streak' is ambiguous" error
-- 2. Ensures RLS policies work with SECURITY DEFINER functions
-- 3. Cleans up function return values to use explicit type casting
-- ============================================================================

-- ============================================================================
-- STEP 1: Fix get_challenge_progress function (ambiguous column error)
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_challenge_progress(UUID);

CREATE OR REPLACE FUNCTION public.get_challenge_progress(p_user_id UUID)
RETURNS TABLE(
  challenge_status TEXT,
  current_day INTEGER,
  challenge_start_date DATE,
  checked_in_today BOOLEAN,
  completed_days INTEGER[],
  days_remaining INTEGER,
  current_streak INTEGER,
  current_milestone INTEGER,
  total_days_completed INTEGER,
  next_milestone INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_milestone_record RECORD;
  v_today DATE := CURRENT_DATE;
  v_checked_today BOOLEAN;
  v_completed_days INTEGER[];
  v_challenge_start DATE;
  v_streak_value INTEGER;  -- Changed variable name to avoid ambiguity
BEGIN
  -- Initialize milestone record if it doesn't exist
  INSERT INTO public.user_milestones (user_id, current_milestone, current_streak, total_days_completed)
  VALUES (p_user_id, 7, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT * INTO v_milestone_record FROM public.user_milestones WHERE user_id = p_user_id;
  
  -- Check if user checked in today
  SELECT EXISTS(
    SELECT 1 FROM public.weight_entries 
    WHERE user_id = p_user_id AND check_in_date = v_today
  ) INTO v_checked_today;
  
  -- Get completed days array
  SELECT ARRAY_AGG(day_number ORDER BY day_number)
  INTO v_completed_days
  FROM public.weight_entries
  WHERE user_id = p_user_id AND day_number IS NOT NULL;
  
  -- Get challenge start date
  SELECT start_date INTO v_challenge_start
  FROM public.user_challenges
  WHERE user_id = p_user_id
  ORDER BY start_date DESC
  LIMIT 1;
  
  -- Get current streak from user_streaks table
  SELECT us.current_streak INTO v_streak_value
  FROM public.user_streaks us
  WHERE us.user_id = p_user_id;
  
  -- Return with explicit column mapping
  RETURN QUERY SELECT
    CASE 
      WHEN v_milestone_record.total_days_completed >= 30 THEN 'completed'::TEXT
      WHEN v_milestone_record.total_days_completed > 0 THEN 'active'::TEXT
      ELSE 'not_started'::TEXT
    END AS challenge_status,
    v_milestone_record.total_days_completed::INTEGER AS current_day,
    v_challenge_start AS challenge_start_date,
    v_checked_today AS checked_in_today,
    COALESCE(v_completed_days, ARRAY[]::INTEGER[]) AS completed_days,
    (CASE 
      WHEN v_milestone_record.current_milestone = 7 THEN 7 - v_milestone_record.total_days_completed
      WHEN v_milestone_record.current_milestone = 14 THEN 14 - v_milestone_record.total_days_completed
      WHEN v_milestone_record.current_milestone = 21 THEN 21 - v_milestone_record.total_days_completed
      ELSE 30 - v_milestone_record.total_days_completed
    END)::INTEGER AS days_remaining,
    COALESCE(v_streak_value, 0)::INTEGER AS current_streak,
    v_milestone_record.current_milestone::INTEGER AS current_milestone,
    v_milestone_record.total_days_completed::INTEGER AS total_days_completed,
    (CASE 
      WHEN v_milestone_record.total_days_completed >= 30 THEN 30
      WHEN v_milestone_record.total_days_completed >= 21 THEN 30
      WHEN v_milestone_record.total_days_completed >= 14 THEN 21
      WHEN v_milestone_record.total_days_completed >= 7 THEN 14
      ELSE 7
    END)::INTEGER AS next_milestone;
    
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in get_challenge_progress: % %', SQLERRM, SQLSTATE;
    RAISE;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_challenge_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_challenge_progress(UUID) TO anon;

-- ============================================================================
-- STEP 2: Verify RLS Policies (should already be correct from script 21)
-- ============================================================================

-- Re-apply RLS policies to ensure they're correct
-- (These should already exist from script 21, but we'll ensure they're correct)

DROP POLICY IF EXISTS "Users can insert own weight entries" ON public.weight_entries;
CREATE POLICY "Users can insert own weight entries"
ON public.weight_entries
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id 
  OR 
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

DROP POLICY IF EXISTS "Users can update own weight entries" ON public.weight_entries;
CREATE POLICY "Users can update own weight entries"
ON public.weight_entries
FOR UPDATE
TO public
USING (
  auth.uid() = user_id 
  OR 
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

-- ============================================================================
-- STEP 3: Verify user_milestones table has correct column
-- ============================================================================

-- Ensure current_streak column exists in user_milestones
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_milestones' 
      AND column_name = 'current_streak'
  ) THEN
    ALTER TABLE public.user_milestones ADD COLUMN current_streak INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check function signature
SELECT 
  routine_name,
  data_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_challenge_progress', 'record_daily_weight_checkin')
ORDER BY routine_name;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('weight_entries', 'user_milestones', 'user_streaks')
ORDER BY tablename, cmd;

-- Check user_milestones columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_milestones'
ORDER BY ordinal_position;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Script completed successfully!';
  RAISE NOTICE '📋 Fixed:';
  RAISE NOTICE '   - Ambiguous column reference in get_challenge_progress';
  RAISE NOTICE '   - RLS policies for SECURITY DEFINER functions';
  RAISE NOTICE '   - Verified user_milestones table structure';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Next steps:';
  RAISE NOTICE '   1. Hard refresh your website (Cmd+Shift+R)';
  RAISE NOTICE '   2. Test weight upload flow';
  RAISE NOTICE '   3. Check dashboard progress display';
END $$;

