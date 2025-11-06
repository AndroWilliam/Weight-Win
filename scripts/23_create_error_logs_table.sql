-- Migration: Create error_logs table for centralized error tracking
-- Created: 2025-11-06

-- Create error_category enum
CREATE TYPE error_category AS ENUM (
  'client_error',
  'api_error',
  'auth_error',
  'ocr_error',
  'network_error',
  'database_error',
  'validation_error',
  'unknown_error'
);

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- For tracking errors across a user session
  category error_category NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  endpoint TEXT, -- API endpoint where error occurred
  http_method TEXT, -- GET, POST, etc.
  http_status_code INTEGER, -- HTTP status code if applicable
  device_info JSONB, -- Browser, OS, device type, etc.
  metadata JSONB, -- Additional error context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_category ON error_logs(category);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_session_id ON error_logs(session_id);

-- Enable Row Level Security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admins can view all error logs
CREATE POLICY "Admins can view all error logs"
  ON error_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Users can view their own error logs (optional - enable if needed for user debugging)
CREATE POLICY "Users can view own error logs"
  ON error_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Anyone can insert error logs (for logging client-side errors)
-- Note: This is intentionally permissive to ensure errors are logged
CREATE POLICY "Anyone can insert error logs"
  ON error_logs
  FOR INSERT
  WITH CHECK (true);

-- Admins can delete error logs (for cleanup)
CREATE POLICY "Admins can delete error logs"
  ON error_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Grant permissions
GRANT SELECT, INSERT ON error_logs TO authenticated;
GRANT SELECT, INSERT ON error_logs TO anon;
GRANT ALL ON error_logs TO service_role;

-- Helper functions for error analytics

-- Function: Get errors by category
CREATE OR REPLACE FUNCTION get_errors_by_category(since_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
  category error_category,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    el.category,
    COUNT(*) as count
  FROM error_logs el
  WHERE el.created_at >= since_date
  GROUP BY el.category
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get top error messages
CREATE OR REPLACE FUNCTION get_top_error_messages(since_date TIMESTAMP WITH TIME ZONE, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  message TEXT,
  count BIGINT,
  category error_category
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    el.message,
    COUNT(*) as count,
    el.category
  FROM error_logs el
  WHERE el.created_at >= since_date
  GROUP BY el.message, el.category
  ORDER BY count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get daily error trend
CREATE OR REPLACE FUNCTION get_daily_error_trend(since_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
  date DATE,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(el.created_at) as date,
    COUNT(*) as count
  FROM error_logs el
  WHERE el.created_at >= since_date
  GROUP BY DATE(el.created_at)
  ORDER BY date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_errors_by_category TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_error_messages TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_error_trend TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Successfully created error_logs table with RLS policies and analytics functions';
END $$;

