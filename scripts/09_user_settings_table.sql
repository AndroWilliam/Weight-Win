-- User Settings & Preferences Table
-- This stores user preferences and tracks setup completion

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Setup completion tracking
  setup_completed BOOLEAN DEFAULT FALSE,
  setup_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Weight preferences
  weight_unit VARCHAR(10) DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lb')),
  
  -- Reminder settings
  reminder_time TIME DEFAULT '08:00:00',
  timezone VARCHAR(100) DEFAULT 'UTC',
  location_permission VARCHAR(20) DEFAULT 'not_asked' CHECK (location_permission IN ('granted', 'denied', 'not_asked')),
  
  -- Consent tracking (from consent page)
  consent_ocr_processing BOOLEAN DEFAULT FALSE,
  consent_data_storage BOOLEAN DEFAULT FALSE,
  consent_share_nutritionist BOOLEAN DEFAULT FALSE,
  consent_given_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one settings record per user
  CONSTRAINT unique_user_settings UNIQUE (user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_settings_timestamp
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_timestamp();

-- Function to upsert user settings (create or update)
CREATE OR REPLACE FUNCTION upsert_user_settings(
  p_user_id UUID,
  p_weight_unit VARCHAR DEFAULT 'kg',
  p_reminder_time TIME DEFAULT '08:00:00',
  p_timezone VARCHAR DEFAULT 'UTC',
  p_location_permission VARCHAR DEFAULT 'not_asked',
  p_consent_ocr BOOLEAN DEFAULT FALSE,
  p_consent_storage BOOLEAN DEFAULT FALSE,
  p_consent_nutritionist BOOLEAN DEFAULT FALSE
)
RETURNS user_settings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings user_settings;
BEGIN
  INSERT INTO user_settings (
    user_id,
    weight_unit,
    reminder_time,
    timezone,
    location_permission,
    consent_ocr_processing,
    consent_data_storage,
    consent_share_nutritionist,
    consent_given_at,
    setup_completed,
    setup_completed_at
  )
  VALUES (
    p_user_id,
    p_weight_unit,
    p_reminder_time,
    p_timezone,
    p_location_permission,
    p_consent_ocr,
    p_consent_storage,
    p_consent_nutritionist,
    NOW(),
    TRUE,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    weight_unit = EXCLUDED.weight_unit,
    reminder_time = EXCLUDED.reminder_time,
    timezone = EXCLUDED.timezone,
    location_permission = EXCLUDED.location_permission,
    consent_ocr_processing = EXCLUDED.consent_ocr_processing,
    consent_data_storage = EXCLUDED.consent_data_storage,
    consent_share_nutritionist = EXCLUDED.consent_share_nutritionist,
    consent_given_at = NOW(),
    setup_completed = TRUE,
    setup_completed_at = NOW(),
    updated_at = NOW()
  RETURNING * INTO v_settings;
  
  RETURN v_settings;
END;
$$;

-- Function to check if user has completed setup
CREATE OR REPLACE FUNCTION has_completed_setup(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_completed BOOLEAN;
BEGIN
  SELECT setup_completed INTO v_completed
  FROM user_settings
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_completed, FALSE);
END;
$$;

-- Comments
COMMENT ON TABLE user_settings IS 'Stores user preferences, settings, and consent tracking';
COMMENT ON FUNCTION upsert_user_settings IS 'Creates or updates user settings (called from setup/consent pages)';
COMMENT ON FUNCTION has_completed_setup IS 'Checks if user has completed the setup flow';

