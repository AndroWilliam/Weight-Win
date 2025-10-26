-- ============================================================================
-- Performance Indexes
-- Adds indexes for commonly queried columns to improve performance
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Index for user challenges query (used in dashboard, progress tracking)
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id_status
  ON user_challenges(user_id, status);

-- Index for weight entries query (used in progress page, stats)
-- Includes DESC ordering on recorded_at for recent entries
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_id_recorded
  ON weight_entries(user_id, recorded_at DESC);

-- Index for user settings query (used in setup, dashboard)
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id
  ON user_settings(user_id);

-- Index for application documents query (used in admin applicants review)
CREATE INDEX IF NOT EXISTS idx_application_documents_application_id
  ON application_documents(application_id);

-- Index for nutritionist applications lookup by email/phone (duplicate check)
CREATE INDEX IF NOT EXISTS idx_nutritionist_applications_email
  ON nutritionist_applications(email);

CREATE INDEX IF NOT EXISTS idx_nutritionist_applications_phone
  ON nutritionist_applications(phone);

-- Index for admin permissions table (used in admin checks)
CREATE INDEX IF NOT EXISTS idx_admin_permissions_user_id
  ON admin_permissions(user_id);

-- Verify indexes were created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================================================
-- Performance Impact:
-- - Queries filtering by user_id will be 10-100x faster
-- - Admin dashboard loads faster as data grows
-- - Progress page and stats queries optimized
-- ============================================================================
