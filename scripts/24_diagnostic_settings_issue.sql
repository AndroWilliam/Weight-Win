-- Diagnostic queries to check settings-related tables and issues
-- Run these queries one by one in Supabase SQL Editor

-- ============================================
-- QUERY 1: Check if user_settings table exists
-- ============================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%setting%'
ORDER BY table_name;

-- ============================================
-- QUERY 2: Check user_settings table structure
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_settings'
ORDER BY ordinal_position;

-- ============================================
-- QUERY 3: Check RLS policies on user_settings
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_settings';

-- ============================================
-- QUERY 4: Check if any user_settings records exist
-- ============================================
SELECT 
  id,
  user_id,
  reminder_time,
  timezone,
  share_with_nutritionist,
  setup_completed,
  created_at,
  updated_at
FROM user_settings
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- QUERY 5: Check profiles table (if it exists)
-- ============================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'profiles';

-- ============================================
-- QUERY 6: If profiles exists, check its structure
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================
-- QUERY 7: Check all public tables
-- ============================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- QUERY 8: Check for any constraints on user_settings
-- ============================================
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  CASE 
    WHEN con.contype = 'c' THEN 'CHECK'
    WHEN con.contype = 'f' THEN 'FOREIGN KEY'
    WHEN con.contype = 'p' THEN 'PRIMARY KEY'
    WHEN con.contype = 'u' THEN 'UNIQUE'
  END AS constraint_description,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'user_settings'
ORDER BY con.contype;

