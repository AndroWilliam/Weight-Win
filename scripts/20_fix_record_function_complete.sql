-- ============================================================================
-- COMPLETE FIX FOR record_daily_weight_checkin Function
-- This version handles all edge cases and permission issues
-- ============================================================================

-- Drop and recreate the function with proper error handling
DROP FUNCTION IF EXISTS public.record_daily_weight_checkin(uuid, numeric, text, numeric);

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
  v_streak_record RECORD;
BEGIN
  -- Check if user already checked in today
  SELECT id INTO v_existing_entry_id
  FROM public.weight_entries
  WHERE user_id = p_user_id 
    AND check_in_date = v_check_in_date
  LIMIT 1;
  
  -- Get user's challenge start date (or create one)
  SELECT start_date INTO v_challenge_start_date
  FROM public.user_challenges
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY start_date DESC
  LIMIT 1;
  
  -- If no active challenge, create one
  IF v_challenge_start_date IS NULL THEN
    INSERT INTO public.user_challenges (user_id, start_date, status)
    VALUES (p_user_id, v_check_in_date, 'active')
    RETURNING start_date INTO v_challenge_start_date;
  END IF;
  
  -- Initialize or get milestone record
  INSERT INTO public.user_milestones (user_id, current_milestone, current_streak, total_days_completed)
  VALUES (p_user_id, 7, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT * INTO v_milestone_record FROM public.user_milestones WHERE user_id = p_user_id;
  
  -- Get total days
  v_total_days := COALESCE(v_milestone_record.total_days_completed, 0);
  
  -- If already checked in today, just update the existing entry
  IF v_existing_entry_id IS NOT NULL THEN
    UPDATE public.weight_entries
    SET weight_kg = p_weight_kg,
        photo_url = p_photo_url,
        ocr_confidence = p_ocr_confidence
    WHERE id = v_existing_entry_id;
    
    v_day_number := v_total_days;
    v_new_milestone := public.calculate_current_milestone(v_total_days);
    
    -- Get current streak
    SELECT current_streak INTO v_current_streak 
    FROM public.user_streaks 
    WHERE user_id = p_user_id;
    v_current_streak := COALESCE(v_current_streak, 0);
    
    RETURN QUERY SELECT 
      v_existing_entry_id,
      v_day_number,
      FALSE,
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
      FALSE,
      NULL::TEXT,
      NULL::TEXT;
    RETURN;
  END IF;
  
  -- New check-in - increment total days
  v_total_days := v_total_days + 1;
  v_day_number := v_total_days;
  v_new_milestone := public.calculate_current_milestone(v_total_days);
  
  -- Insert new weight entry
  INSERT INTO public.weight_entries (user_id, weight_kg, photo_url, ocr_confidence, check_in_date, day_number, recorded_at)
  VALUES (p_user_id, p_weight_kg, p_photo_url, p_ocr_confidence, v_check_in_date, v_day_number, NOW())
  RETURNING id INTO v_new_entry_id;
  
  -- Update or create streak record (handle separately to avoid RETURNING issues)
  INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_check_in, streak_started_at)
  VALUES (p_user_id, 1, 1, v_check_in_date, v_check_in_date)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get existing streak record
  SELECT * INTO v_streak_record FROM public.user_streaks WHERE user_id = p_user_id;
  
  -- Calculate new streak
  IF v_streak_record.last_check_in = v_check_in_date - INTERVAL '1 day' THEN
    v_current_streak := v_streak_record.current_streak + 1;
  ELSE
    v_current_streak := 1;
  END IF;
  
  -- Update streak
  UPDATE public.user_streaks
  SET current_streak = v_current_streak,
      longest_streak = GREATEST(longest_streak, v_current_streak),
      last_check_in = v_check_in_date,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Check for milestone completion and award badges
  IF v_total_days = 7 AND v_milestone_record.milestone_7_completed_at IS NULL THEN
    UPDATE public.user_milestones
    SET milestone_7_completed_at = NOW()
    WHERE user_id = p_user_id;
    
    SELECT * INTO v_badge_record FROM public.milestone_badges WHERE milestone_day = 7;
    IF v_badge_record IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_id, milestone_completed)
      VALUES (p_user_id, v_badge_record.id, 7)
      ON CONFLICT DO NOTHING;
      
      v_badge_awarded := TRUE;
      v_awarded_badge_name := v_badge_record.badge_name;
      v_awarded_badge_icon := v_badge_record.badge_icon_url;
    END IF;
    
  ELSIF v_total_days = 14 AND v_milestone_record.milestone_14_completed_at IS NULL THEN
    UPDATE public.user_milestones
    SET milestone_14_completed_at = NOW()
    WHERE user_id = p_user_id;
    
    SELECT * INTO v_badge_record FROM public.milestone_badges WHERE milestone_day = 14;
    IF v_badge_record IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_id, milestone_completed)
      VALUES (p_user_id, v_badge_record.id, 14)
      ON CONFLICT DO NOTHING;
      
      v_badge_awarded := TRUE;
      v_awarded_badge_name := v_badge_record.badge_name;
      v_awarded_badge_icon := v_badge_record.badge_icon_url;
    END IF;
    
  ELSIF v_total_days = 21 AND v_milestone_record.milestone_21_completed_at IS NULL THEN
    UPDATE public.user_milestones
    SET milestone_21_completed_at = NOW()
    WHERE user_id = p_user_id;
    
    SELECT * INTO v_badge_record FROM public.milestone_badges WHERE milestone_day = 21;
    IF v_badge_record IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_id, milestone_completed)
      VALUES (p_user_id, v_badge_record.id, 21)
      ON CONFLICT DO NOTHING;
      
      v_badge_awarded := TRUE;
      v_awarded_badge_name := v_badge_record.badge_name;
      v_awarded_badge_icon := v_badge_record.badge_icon_url;
    END IF;
    
  ELSIF v_total_days = 30 AND v_milestone_record.milestone_30_completed_at IS NULL THEN
    UPDATE public.user_milestones
    SET milestone_30_completed_at = NOW()
    WHERE user_id = p_user_id;
    
    SELECT * INTO v_badge_record FROM public.milestone_badges WHERE milestone_day = 30;
    IF v_badge_record IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_id, milestone_completed)
      VALUES (p_user_id, v_badge_record.id, 30)
      ON CONFLICT DO NOTHING;
      
      v_badge_awarded := TRUE;
      v_awarded_badge_name := v_badge_record.badge_name;
      v_awarded_badge_icon := v_badge_record.badge_icon_url;
    END IF;
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
    
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise it
    RAISE NOTICE 'Error in record_daily_weight_checkin: % %', SQLERRM, SQLSTATE;
    RAISE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.record_daily_weight_checkin(uuid, numeric, text, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_daily_weight_checkin(uuid, numeric, text, numeric) TO anon;

