-- Helper functions for WeightWin app logic

-- Function to get user's current active challenge
CREATE OR REPLACE FUNCTION get_current_challenge(user_uuid UUID)
RETURNS TABLE (
  challenge_id UUID,
  start_date DATE,
  days_completed INTEGER,
  status VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.id as challenge_id,
    uc.start_date,
    COALESCE(COUNT(te.day_number), 0)::INTEGER as days_completed,
    uc.status
  FROM user_challenges uc
  LEFT JOIN tracking_entries te ON uc.id = te.challenge_id
  WHERE uc.user_id = user_uuid 
    AND uc.status = 'active'
  GROUP BY uc.id, uc.start_date, uc.status
  ORDER BY uc.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can track today (hasn't missed a day)
CREATE OR REPLACE FUNCTION can_track_today(challenge_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  challenge_start_date DATE;
  days_since_start INTEGER;
  entries_count INTEGER;
BEGIN
  -- Get challenge start date
  SELECT start_date INTO challenge_start_date
  FROM user_challenges 
  WHERE id = challenge_uuid;
  
  IF challenge_start_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate days since challenge started
  days_since_start := CURRENT_DATE - challenge_start_date + 1;
  
  -- Count existing entries
  SELECT COUNT(*) INTO entries_count
  FROM tracking_entries 
  WHERE challenge_id = challenge_uuid;
  
  -- Can track if entries match expected days (no gaps)
  RETURN entries_count = days_since_start - 1 AND days_since_start <= 7;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get next available expert session
CREATE OR REPLACE FUNCTION get_next_expert_session()
RETURNS TABLE (
  session_id UUID,
  session_date DATE,
  available_spots INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    es.id as session_id,
    es.session_date,
    (es.max_participants - es.current_participants) as available_spots
  FROM expert_sessions es
  WHERE es.session_date > CURRENT_DATE
    AND es.current_participants < es.max_participants
  ORDER BY es.session_date ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a challenge and assign expert session
CREATE OR REPLACE FUNCTION complete_challenge(challenge_uuid UUID)
RETURNS UUID AS $$
DECLARE
  user_uuid UUID;
  start_weight DECIMAL(5,2);
  end_weight DECIMAL(5,2);
  weight_change DECIMAL(5,2);
  session_uuid UUID;
  completion_uuid UUID;
BEGIN
  -- Get user and weight data
  SELECT uc.user_id INTO user_uuid
  FROM user_challenges uc
  WHERE uc.id = challenge_uuid;
  
  -- Get start and end weights
  SELECT te.weight_kg INTO start_weight
  FROM tracking_entries te
  WHERE te.challenge_id = challenge_uuid AND te.day_number = 1;
  
  SELECT te.weight_kg INTO end_weight
  FROM tracking_entries te
  WHERE te.challenge_id = challenge_uuid AND te.day_number = 7;
  
  -- Calculate weight change
  weight_change := end_weight - start_weight;
  
  -- Get next available expert session
  SELECT session_id INTO session_uuid
  FROM get_next_expert_session()
  LIMIT 1;
  
  -- Update challenge status
  UPDATE user_challenges 
  SET status = 'completed', updated_at = NOW()
  WHERE id = challenge_uuid;
  
  -- Create completion record
  INSERT INTO challenge_completions (
    user_id, 
    challenge_id, 
    expert_session_id, 
    weight_change_kg
  ) VALUES (
    user_uuid, 
    challenge_uuid, 
    session_uuid, 
    weight_change
  ) RETURNING id INTO completion_uuid;
  
  -- Update expert session participant count
  IF session_uuid IS NOT NULL THEN
    UPDATE expert_sessions 
    SET current_participants = current_participants + 1
    WHERE id = session_uuid;
  END IF;
  
  RETURN completion_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
