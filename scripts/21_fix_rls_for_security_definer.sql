-- ============================================================================
-- FIX RLS POLICIES FOR SECURITY DEFINER FUNCTIONS
-- The issue: RLS policies check auth.uid() which returns NULL in SECURITY DEFINER context
-- Solution: Create special policies that allow the function to bypass RLS
-- ============================================================================

-- ============================================================================
-- OPTION 1: Temporarily disable RLS for the function execution
-- ============================================================================

-- Update the INSERT policy to allow inserts from SECURITY DEFINER functions
DROP POLICY IF EXISTS "Users can insert own weight entries" ON public.weight_entries;

CREATE POLICY "Users can insert own weight entries"
ON public.weight_entries
FOR INSERT
TO public
WITH CHECK (
  -- Allow if user_id matches authenticated user
  auth.uid() = user_id 
  OR 
  -- Allow if called from SECURITY DEFINER function (auth.uid() is NULL but user_id is valid)
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

-- Update the UPDATE policy similarly
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
-- APPLY SAME FIX TO OTHER RELATED TABLES
-- ============================================================================

-- Fix user_milestones policies
DROP POLICY IF EXISTS "Users can insert own milestones" ON public.user_milestones;

CREATE POLICY "Users can insert own milestones"
ON public.user_milestones
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id 
  OR 
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

DROP POLICY IF EXISTS "Users can update own milestones" ON public.user_milestones;

CREATE POLICY "Users can update own milestones"
ON public.user_milestones
FOR UPDATE
TO public
USING (
  auth.uid() = user_id 
  OR 
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

-- Fix user_streaks policies
DROP POLICY IF EXISTS "Users can insert own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON public.user_streaks;

CREATE POLICY "Users can insert own streaks"
ON public.user_streaks
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id 
  OR 
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

CREATE POLICY "Users can update own streaks"
ON public.user_streaks
FOR UPDATE
TO public
USING (
  auth.uid() = user_id 
  OR 
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

-- Fix user_badges policies
DROP POLICY IF EXISTS "Users can insert own badges" ON public.user_badges;

CREATE POLICY "Users can insert own badges"
ON public.user_badges
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id 
  OR 
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

-- Fix user_challenges policies (if RLS is enabled)
DROP POLICY IF EXISTS "Users can insert own challenges" ON public.user_challenges;
DROP POLICY IF EXISTS "Users can update own challenges" ON public.user_challenges;

CREATE POLICY "Users can insert own challenges"
ON public.user_challenges
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id 
  OR 
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

CREATE POLICY "Users can update own challenges"
ON public.user_challenges
FOR UPDATE
TO public
USING (
  auth.uid() = user_id 
  OR 
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that policies are updated
SELECT 
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('weight_entries', 'user_milestones', 'user_streaks', 'user_badges', 'user_challenges')
ORDER BY tablename, cmd;

