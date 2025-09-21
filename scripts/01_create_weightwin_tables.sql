-- WeightWin Database Schema
-- Creates tables for 7-day weight tracking challenges

-- User challenges table - tracks each user's 7-day commitment
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'restarted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily tracking entries - stores weight and photo data
CREATE TABLE IF NOT EXISTS tracking_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES user_challenges(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
  weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg > 0 AND weight_kg < 1000),
  photo_url TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, day_number)
);

-- Expert sessions - manages nutrition expert session scheduling
CREATE TABLE IF NOT EXISTS expert_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_date DATE NOT NULL,
  max_participants INTEGER DEFAULT 20 CHECK (max_participants > 0),
  current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_date)
);

-- Challenge completions - tracks users who completed challenges and earned sessions
CREATE TABLE IF NOT EXISTS challenge_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES user_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expert_session_id UUID REFERENCES expert_sessions(id),
  weight_change_kg DECIMAL(5,2),
  UNIQUE(challenge_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON user_challenges(status);
CREATE INDEX IF NOT EXISTS idx_tracking_entries_challenge_id ON tracking_entries(challenge_id);
CREATE INDEX IF NOT EXISTS idx_tracking_entries_day_number ON tracking_entries(day_number);
CREATE INDEX IF NOT EXISTS idx_expert_sessions_date ON expert_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_user_id ON challenge_completions(user_id);

-- Enable Row Level Security (RLS) for data protection
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_challenges
CREATE POLICY "Users can view own challenges" ON user_challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges" ON user_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" ON user_challenges
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for tracking_entries
CREATE POLICY "Users can view own tracking entries" ON tracking_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_challenges 
      WHERE user_challenges.id = tracking_entries.challenge_id 
      AND user_challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own tracking entries" ON tracking_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_challenges 
      WHERE user_challenges.id = tracking_entries.challenge_id 
      AND user_challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own tracking entries" ON tracking_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_challenges 
      WHERE user_challenges.id = tracking_entries.challenge_id 
      AND user_challenges.user_id = auth.uid()
    )
  );

-- RLS Policies for challenge_completions
CREATE POLICY "Users can view own completions" ON challenge_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions" ON challenge_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Expert sessions are publicly readable (no user-specific data)
CREATE POLICY "Anyone can view expert sessions" ON expert_sessions
  FOR SELECT USING (true);
