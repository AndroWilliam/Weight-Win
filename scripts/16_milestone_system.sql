-- Milestone-Based Streak System
-- This script creates tables and functions for progressive milestones (7, 14, 21, 30 days)

-- ============================================================================
-- TABLES
-- ============================================================================

-- User Milestones Table
CREATE TABLE IF NOT EXISTS public.user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_milestone INTEGER NOT NULL DEFAULT 7 CHECK (current_milestone IN (7, 14, 21, 30)),
  current_streak INTEGER NOT NULL DEFAULT 0,
  total_days_completed INTEGER NOT NULL DEFAULT 0,
  
  -- Milestone completion timestamps
  milestone_7_completed_at TIMESTAMP WITH TIME ZONE,
  milestone_14_completed_at TIMESTAMP WITH TIME ZONE,
  milestone_21_completed_at TIMESTAMP WITH TIME ZONE,
  milestone_30_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestone Badges Table (predefined badges)
CREATE TABLE IF NOT EXISTS public.milestone_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_day INTEGER NOT NULL UNIQUE CHECK (milestone_day IN (7, 14, 21, 30)),
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  badge_icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badges Table (tracks awarded badges)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.milestone_badges(id) ON DELETE CASCADE,
  milestone_completed INTEGER NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can't earn the same badge twice
  UNIQUE(user_id, badge_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id ON public.user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON public.user_badges(earned_at DESC);

-- ============================================================================
-- SEED MILESTONE BADGES
-- ============================================================================

INSERT INTO public.milestone_badges (milestone_day, badge_name, badge_description, badge_icon_url)
VALUES
  (7, 'Week Warrior', 'Complete 7 consecutive days of weight tracking', '🏆'),
  (14, 'Fortnight Champion', 'Maintain your streak for 14 days straight', '🥇'),
  (21, 'Triple Week Legend', 'Achieve an impressive 21-day tracking streak', '⭐'),
  (30, 'Monthly Master', 'Complete a full month of consistent tracking', '👑')
ON CONFLICT (milestone_day) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- User Milestones Policies
CREATE POLICY "Users can view own milestones"
  ON public.user_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON public.user_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON public.user_milestones FOR UPDATE
  USING (auth.uid() = user_id);

-- Milestone Badges Policies (public read)
CREATE POLICY "Everyone can view milestone badges"
  ON public.milestone_badges FOR SELECT
  USING (true);

-- User Badges Policies
CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate current milestone based on total days
CREATE OR REPLACE FUNCTION public.calculate_current_milestone(p_total_days INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_total_days <= 7 THEN
    RETURN 7;
  ELSIF p_total_days <= 14 THEN
    RETURN 14;
  ELSIF p_total_days <= 21 THEN
    RETURN 21;
  ELSE
    RETURN 30;
  END IF;
END;
$$;

-- Function to get user milestone progress
CREATE OR REPLACE FUNCTION public.get_user_milestone_progress(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_milestone RECORD;
  v_completed_days INTEGER[];
  v_next_milestone INTEGER;
  v_days_to_next INTEGER;
BEGIN
  -- Get or create milestone record
  INSERT INTO public.user_milestones (user_id, current_milestone, current_streak, total_days_completed)
  VALUES (p_user_id, 7, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT * INTO v_milestone FROM public.user_milestones WHERE user_id = p_user_id;
  
  -- Get array of completed day numbers (1-30)
  SELECT ARRAY_AGG(day_number ORDER BY day_number)
  INTO v_completed_days
  FROM public.weight_entries
  WHERE user_id = p_user_id AND day_number IS NOT NULL;
  
  -- Calculate next milestone
  IF v_milestone.total_days_completed >= 30 THEN
    v_next_milestone := 30;
    v_days_to_next := 0;
  ELSIF v_milestone.total_days_completed >= 21 THEN
    v_next_milestone := 30;
    v_days_to_next := 30 - v_milestone.total_days_completed;
  ELSIF v_milestone.total_days_completed >= 14 THEN
    v_next_milestone := 21;
    v_days_to_next := 21 - v_milestone.total_days_completed;
  ELSIF v_milestone.total_days_completed >= 7 THEN
    v_next_milestone := 14;
    v_days_to_next := 14 - v_milestone.total_days_completed;
  ELSE
    v_next_milestone := 7;
    v_days_to_next := 7 - v_milestone.total_days_completed;
  END IF;
  
  RETURN json_build_object(
    'current_day', v_milestone.total_days_completed,
    'current_milestone', v_milestone.current_milestone,
    'current_streak', v_milestone.current_streak,
    'total_days_completed', v_milestone.total_days_completed,
    'next_milestone', v_next_milestone,
    'days_to_next_milestone', v_days_to_next,
    'completed_days_array', COALESCE(v_completed_days, ARRAY[]::INTEGER[]),
    'milestone_7_completed', v_milestone.milestone_7_completed_at IS NOT NULL,
    'milestone_14_completed', v_milestone.milestone_14_completed_at IS NOT NULL,
    'milestone_21_completed', v_milestone.milestone_21_completed_at IS NOT NULL,
    'milestone_30_completed', v_milestone.milestone_30_completed_at IS NOT NULL
  );
END;
$$;

-- Function to get user badges
CREATE OR REPLACE FUNCTION public.get_user_badges(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_badges JSON;
  v_total_badges INTEGER;
BEGIN
  -- Get all badges with earned status
  SELECT json_agg(
    json_build_object(
      'badge_id', mb.id,
      'milestone_day', mb.milestone_day,
      'badge_name', mb.badge_name,
      'badge_description', mb.badge_description,
      'badge_icon', mb.badge_icon_url,
      'earned', ub.earned_at IS NOT NULL,
      'earned_at', ub.earned_at
    ) ORDER BY mb.milestone_day
  )
  INTO v_badges
  FROM public.milestone_badges mb
  LEFT JOIN public.user_badges ub ON ub.badge_id = mb.id AND ub.user_id = p_user_id;
  
  -- Count earned badges
  SELECT COUNT(*) INTO v_total_badges
  FROM public.user_badges
  WHERE user_id = p_user_id;
  
  RETURN json_build_object(
    'badges', COALESCE(v_badges, '[]'::json),
    'total_earned', v_total_badges
  );
END;
$$;

-- ============================================================================
-- UPDATE RECORD DAILY WEIGHT CHECKIN FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.record_daily_weight_checkin(
  p_user_id UUID,
  p_weight_kg DECIMAL,
  p_photo_url TEXT,
  p_ocr_confidence DECIMAL DEFAULT NULL
)
RETURNS TABLE(
  weight_entry_id BIGINT,
  day_number INTEGER,
  is_new_day BOOLEAN,
  current_streak INTEGER,
  days_remaining INTEGER,
  current_milestone INTEGER,
  total_days_completed INTEGER,
  next_milestone INTEGER,
  new_badge_earned BOOLEAN,
  badge_name TEXT,
  badge_icon TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_check_in_date DATE := CURRENT_DATE;
  v_existing_entry_id BIGINT;
  v_challenge_start_date DATE;
  v_day_number INTEGER;
  v_current_streak INTEGER;
  v_new_entry_id BIGINT;
  v_milestone_record RECORD;
  v_total_days INTEGER;
  v_new_milestone INTEGER;
  v_badge_record RECORD;
  v_badge_awarded BOOLEAN := FALSE;
  v_awarded_badge_name TEXT;
  v_awarded_badge_icon TEXT;
BEGIN
  -- Check if user already checked in today
  SELECT id INTO v_existing_entry_id
  FROM weight_entries
  WHERE user_id = p_user_id 
    AND check_in_date = v_check_in_date
  LIMIT 1;
  
  -- Get user's challenge start date
  SELECT start_date INTO v_challenge_start_date
  FROM user_challenges
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY start_date DESC
  LIMIT 1;
  
  -- If no active challenge, create one
  IF v_challenge_start_date IS NULL THEN
    INSERT INTO user_challenges (user_id, start_date, status)
    VALUES (p_user_id, v_check_in_date, 'active')
    RETURNING start_date INTO v_challenge_start_date;
  END IF;
  
  -- Initialize or get milestone record
  INSERT INTO public.user_milestones (user_id, current_milestone, current_streak, total_days_completed)
  VALUES (p_user_id, 7, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT * INTO v_milestone_record FROM public.user_milestones WHERE user_id = p_user_id;
  
  -- Calculate total days (continuous streak from day 1)
  v_total_days := v_milestone_record.total_days_completed;
  
  -- If already checked in today, update existing entry
  IF v_existing_entry_id IS NOT NULL THEN
    UPDATE weight_entries
    SET weight_kg = p_weight_kg,
        photo_url = p_photo_url,
        ocr_confidence = p_ocr_confidence
    WHERE id = v_existing_entry_id;
    
    v_day_number := v_total_days;
    v_new_milestone := calculate_current_milestone(v_total_days);
    
    RETURN QUERY SELECT 
      v_existing_entry_id,
      v_day_number,
      FALSE,
      v_milestone_record.current_streak,
      CASE 
        WHEN v_new_milestone = 7 THEN 7 - v_total_days
        WHEN v_new_milestone = 14 THEN 14 - v_total_days
        WHEN v_new_milestone = 21 THEN 21 - v_total_days
        ELSE 30 - v_total_days
      END,
      v_new_milestone,
      v_total_days,
      CASE 
        WHEN v_total_days >= 30 THEN 30
        WHEN v_total_days >= 21 THEN 30
        WHEN v_total_days >= 14 THEN 21
        WHEN v_total_days >= 7 THEN 14
        ELSE 7
      END,
      FALSE,
      NULL::TEXT,
      NULL::TEXT;
    RETURN;
  END IF;
  
  -- New check-in - increment total days
  v_total_days := v_total_days + 1;
  v_day_number := v_total_days;
  v_new_milestone := calculate_current_milestone(v_total_days);
  
  -- Insert new weight entry
  INSERT INTO weight_entries (user_id, weight_kg, photo_url, ocr_confidence, check_in_date, day_number, recorded_at)
  VALUES (p_user_id, p_weight_kg, p_photo_url, p_ocr_confidence, v_check_in_date, v_day_number, NOW())
  RETURNING id INTO v_new_entry_id;
  
  -- Update streak in user_streaks table
  INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_check_in, streak_started_at)
  VALUES (p_user_id, 1, 1, v_check_in_date, v_check_in_date)
  ON CONFLICT (user_id) DO UPDATE
  SET current_streak = CASE 
        WHEN user_streaks.last_check_in = v_check_in_date - INTERVAL '1 day' THEN user_streaks.current_streak + 1
        ELSE 1
      END,
      longest_streak = GREATEST(
        user_streaks.longest_streak,
        CASE 
          WHEN user_streaks.last_check_in = v_check_in_date - INTERVAL '1 day' THEN user_streaks.current_streak + 1
          ELSE 1
        END
      ),
      last_check_in = v_check_in_date,
      updated_at = NOW()
  RETURNING current_streak INTO v_current_streak;
  
  -- Check for milestone completion and award badges
  IF v_total_days = 7 AND v_milestone_record.milestone_7_completed_at IS NULL THEN
    UPDATE public.user_milestones
    SET milestone_7_completed_at = NOW()
    WHERE user_id = p_user_id;
    
    SELECT * INTO v_badge_record FROM public.milestone_badges WHERE milestone_day = 7;
    INSERT INTO public.user_badges (user_id, badge_id, milestone_completed)
    VALUES (p_user_id, v_badge_record.id, 7)
    ON CONFLICT DO NOTHING;
    
    v_badge_awarded := TRUE;
    v_awarded_badge_name := v_badge_record.badge_name;
    v_awarded_badge_icon := v_badge_record.badge_icon_url;
    
  ELSIF v_total_days = 14 AND v_milestone_record.milestone_14_completed_at IS NULL THEN
    UPDATE public.user_milestones
    SET milestone_14_completed_at = NOW()
    WHERE user_id = p_user_id;
    
    SELECT * INTO v_badge_record FROM public.milestone_badges WHERE milestone_day = 14;
    INSERT INTO public.user_badges (user_id, badge_id, milestone_completed)
    VALUES (p_user_id, v_badge_record.id, 14)
    ON CONFLICT DO NOTHING;
    
    v_badge_awarded := TRUE;
    v_awarded_badge_name := v_badge_record.badge_name;
    v_awarded_badge_icon := v_badge_record.badge_icon_url;
    
  ELSIF v_total_days = 21 AND v_milestone_record.milestone_21_completed_at IS NULL THEN
    UPDATE public.user_milestones
    SET milestone_21_completed_at = NOW()
    WHERE user_id = p_user_id;
    
    SELECT * INTO v_badge_record FROM public.milestone_badges WHERE milestone_day = 21;
    INSERT INTO public.user_badges (user_id, badge_id, milestone_completed)
    VALUES (p_user_id, v_badge_record.id, 21)
    ON CONFLICT DO NOTHING;
    
    v_badge_awarded := TRUE;
    v_awarded_badge_name := v_badge_record.badge_name;
    v_awarded_badge_icon := v_badge_record.badge_icon_url;
    
  ELSIF v_total_days = 30 AND v_milestone_record.milestone_30_completed_at IS NULL THEN
    UPDATE public.user_milestones
    SET milestone_30_completed_at = NOW()
    WHERE user_id = p_user_id;
    
    SELECT * INTO v_badge_record FROM public.milestone_badges WHERE milestone_day = 30;
    INSERT INTO public.user_badges (user_id, badge_id, milestone_completed)
    VALUES (p_user_id, v_badge_record.id, 30)
    ON CONFLICT DO NOTHING;
    
    v_badge_awarded := TRUE;
    v_awarded_badge_name := v_badge_record.badge_name;
    v_awarded_badge_icon := v_badge_record.badge_icon_url;
  END IF;
  
  -- Update user_milestones
  UPDATE public.user_milestones
  SET total_days_completed = v_total_days,
      current_milestone = v_new_milestone,
      current_streak = v_current_streak,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Return result
  RETURN QUERY SELECT 
    v_new_entry_id,
    v_day_number,
    TRUE,
    v_current_streak,
    CASE 
      WHEN v_new_milestone = 7 THEN 7 - v_total_days
      WHEN v_new_milestone = 14 THEN 14 - v_total_days
      WHEN v_new_milestone = 21 THEN 21 - v_total_days
      ELSE 30 - v_total_days
    END,
    v_new_milestone,
    v_total_days,
    CASE 
      WHEN v_total_days >= 30 THEN 30
      WHEN v_total_days >= 21 THEN 30
      WHEN v_total_days >= 14 THEN 21
      WHEN v_total_days >= 7 THEN 14
      ELSE 7
    END,
    v_badge_awarded,
    v_awarded_badge_name,
    v_awarded_badge_icon;
END;
$$;

-- ============================================================================
-- UPDATE GET CHALLENGE PROGRESS FUNCTION
-- ============================================================================

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
  v_current_streak INTEGER;
BEGIN
  -- Initialize milestone record if it doesn't exist
  INSERT INTO public.user_milestones (user_id, current_milestone, current_streak, total_days_completed)
  VALUES (p_user_id, 7, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT * INTO v_milestone_record FROM public.user_milestones WHERE user_id = p_user_id;
  
  -- Check if user checked in today
  SELECT EXISTS(
    SELECT 1 FROM weight_entries 
    WHERE user_id = p_user_id AND check_in_date = v_today
  ) INTO v_checked_today;
  
  -- Get completed days array
  SELECT ARRAY_AGG(day_number ORDER BY day_number)
  INTO v_completed_days
  FROM weight_entries
  WHERE user_id = p_user_id AND day_number IS NOT NULL;
  
  -- Get challenge start date
  SELECT start_date INTO v_challenge_start
  FROM user_challenges
  WHERE user_id = p_user_id
  ORDER BY start_date DESC
  LIMIT 1;
  
  -- Get current streak
  SELECT current_streak INTO v_current_streak
  FROM user_streaks
  WHERE user_id = p_user_id;
  
  RETURN QUERY SELECT
    CASE 
      WHEN v_milestone_record.total_days_completed >= 30 THEN 'completed'
      WHEN v_milestone_record.total_days_completed > 0 THEN 'active'
      ELSE 'not_started'
    END,
    v_milestone_record.total_days_completed,
    v_challenge_start,
    v_checked_today,
    COALESCE(v_completed_days, ARRAY[]::INTEGER[]),
    CASE 
      WHEN v_milestone_record.current_milestone = 7 THEN 7 - v_milestone_record.total_days_completed
      WHEN v_milestone_record.current_milestone = 14 THEN 14 - v_milestone_record.total_days_completed
      WHEN v_milestone_record.current_milestone = 21 THEN 21 - v_milestone_record.total_days_completed
      ELSE 30 - v_milestone_record.total_days_completed
    END,
    COALESCE(v_current_streak, 0),
    v_milestone_record.current_milestone,
    v_milestone_record.total_days_completed,
    CASE 
      WHEN v_milestone_record.total_days_completed >= 30 THEN 30
      WHEN v_milestone_record.total_days_completed >= 21 THEN 30
      WHEN v_milestone_record.total_days_completed >= 14 THEN 21
      WHEN v_milestone_record.total_days_completed >= 7 THEN 14
      ELSE 7
    END;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_milestone_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_milestones_timestamp
BEFORE UPDATE ON public.user_milestones
FOR EACH ROW
EXECUTE FUNCTION update_milestone_timestamp();

-- ============================================================================
-- MIGRATION FOR EXISTING USERS
-- ============================================================================

-- Migrate existing users to milestone system
DO $$
DECLARE
  user_record RECORD;
  total_entries INTEGER;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT user_id FROM weight_entries
  LOOP
    -- Count total weight entries for this user
    SELECT COUNT(*) INTO total_entries
    FROM weight_entries
    WHERE user_id = user_record.user_id;
    
    -- Create milestone record if doesn't exist
    INSERT INTO public.user_milestones (
      user_id,
      current_milestone,
      current_streak,
      total_days_completed
    )
    VALUES (
      user_record.user_id,
      calculate_current_milestone(total_entries),
      total_entries,
      total_entries
    )
    ON CONFLICT (user_id) DO UPDATE
    SET total_days_completed = total_entries,
        current_milestone = calculate_current_milestone(total_entries),
        current_streak = total_entries;
  END LOOP;
END $$;

