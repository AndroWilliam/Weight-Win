-- Fix Streak System: Daily Weight Check-in & Challenge Progress
-- This migration fixes the foreign key constraints and creates/updates the streak functions

-- ============================================================================
-- PART 1: Fix Foreign Key Constraints to reference auth.users
-- ============================================================================

-- Fix user_challenges foreign key
ALTER TABLE user_challenges
DROP CONSTRAINT IF EXISTS user_challenges_user_id_fkey;

ALTER TABLE user_challenges
ADD CONSTRAINT user_challenges_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Fix weight_entries foreign key
ALTER TABLE weight_entries
DROP CONSTRAINT IF EXISTS weight_entries_user_id_fkey;

ALTER TABLE weight_entries
ADD CONSTRAINT weight_entries_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Fix user_streaks foreign key
ALTER TABLE user_streaks
DROP CONSTRAINT IF EXISTS user_streaks_user_id_fkey;

ALTER TABLE user_streaks
ADD CONSTRAINT user_streaks_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Fix challenge_completions foreign key
ALTER TABLE challenge_completions
DROP CONSTRAINT IF EXISTS challenge_completions_user_id_fkey;

ALTER TABLE challenge_completions
ADD CONSTRAINT challenge_completions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- ============================================================================
-- PART 2: Create/Replace record_daily_weight_checkin Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.record_daily_weight_checkin(
  p_user_id uuid, 
  p_weight_kg numeric, 
  p_photo_url text, 
  p_ocr_confidence numeric DEFAULT NULL::numeric
)
RETURNS TABLE(
  weight_entry_id bigint, 
  day_number integer, 
  is_new_day boolean, 
  current_streak integer, 
  days_remaining integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_check_in_date DATE := CURRENT_DATE;
  v_existing_entry_id BIGINT;
  v_challenge_start_date DATE;
  v_day_number INTEGER;
  v_current_streak INTEGER;
  v_new_entry_id BIGINT;
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
  
  -- Calculate which day of the challenge this is (1-7)
  v_day_number := (v_check_in_date - v_challenge_start_date)::INTEGER + 1;
  
  -- Ensure day_number is between 1 and 7
  IF v_day_number < 1 THEN
    v_day_number := 1;
  ELSIF v_day_number > 7 THEN
    v_day_number := 7;
  END IF;
  
  -- If already checked in today, update existing entry
  IF v_existing_entry_id IS NOT NULL THEN
    UPDATE weight_entries
    SET weight_kg = p_weight_kg,
        photo_url = p_photo_url,
        ocr_confidence = p_ocr_confidence,
        day_number = v_day_number,
        recorded_at = NOW()
    WHERE id = v_existing_entry_id;
    
    v_new_entry_id := v_existing_entry_id;
    
    -- Get current streak
    SELECT user_streaks.current_streak INTO v_current_streak
    FROM user_streaks
    WHERE user_id = p_user_id;
    
    -- Return existing entry (not a new day)
    RETURN QUERY SELECT 
      v_new_entry_id,
      v_day_number,
      FALSE, -- is_new_day
      COALESCE(v_current_streak, 0),
      GREATEST(0, 7 - v_day_number);
      
  ELSE
    -- Create new entry for today
    INSERT INTO weight_entries (
      user_id, 
      weight_kg, 
      photo_url, 
      ocr_confidence,
      check_in_date,
      day_number,
      recorded_at
    )
    VALUES (
      p_user_id, 
      p_weight_kg, 
      p_photo_url, 
      p_ocr_confidence,
      v_check_in_date,
      v_day_number,
      NOW()
    )
    RETURNING id INTO v_new_entry_id;
    
    -- Update user_streaks
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_check_in, streak_started_at)
    VALUES (p_user_id, 1, 1, v_check_in_date, v_check_in_date)
    ON CONFLICT (user_id) DO UPDATE
    SET 
      last_check_in = v_check_in_date,
      current_streak = CASE
        WHEN user_streaks.last_check_in = v_check_in_date - INTERVAL '1 day' 
        THEN user_streaks.current_streak + 1
        WHEN user_streaks.last_check_in = v_check_in_date 
        THEN user_streaks.current_streak
        ELSE 1
      END,
      longest_streak = GREATEST(
        user_streaks.longest_streak,
        CASE
          WHEN user_streaks.last_check_in = v_check_in_date - INTERVAL '1 day' 
          THEN user_streaks.current_streak + 1
          ELSE 1
        END
      ),
      streak_started_at = CASE
        WHEN user_streaks.last_check_in = v_check_in_date - INTERVAL '1 day'
        THEN user_streaks.streak_started_at
        ELSE v_check_in_date
      END,
      updated_at = NOW()
    RETURNING user_streaks.current_streak INTO v_current_streak;
    
    -- Return new entry (new day!)
    RETURN QUERY SELECT 
      v_new_entry_id,
      v_day_number,
      TRUE, -- is_new_day
      v_current_streak,
      GREATEST(0, 7 - v_day_number);
  END IF;
END;
$function$;

-- ============================================================================
-- PART 3: Verify get_challenge_progress Function exists
-- ============================================================================
-- This function should already exist from the previous migration
-- If it doesn't, you'll need to create it

-- Test query (optional, can be removed):
-- SELECT * FROM get_challenge_progress('YOUR-USER-ID-HERE'::uuid);

