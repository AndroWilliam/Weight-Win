-- Fix Weight Entries Table for Milestone System
-- Add missing columns required by the new record_daily_weight_checkin function

-- ============================================================================
-- ADD MISSING COLUMNS TO WEIGHT_ENTRIES
-- ============================================================================

-- Add check_in_date column (tracks the calendar date of check-in)
ALTER TABLE public.weight_entries
ADD COLUMN IF NOT EXISTS check_in_date DATE DEFAULT CURRENT_DATE;

-- Add day_number column (tracks which day in the challenge: 1-30)
ALTER TABLE public.weight_entries
ADD COLUMN IF NOT EXISTS day_number INTEGER;

-- Add index for check_in_date for faster queries
CREATE INDEX IF NOT EXISTS idx_weight_entries_check_in_date 
ON public.weight_entries(user_id, check_in_date);

-- Add index for day_number
CREATE INDEX IF NOT EXISTS idx_weight_entries_day_number 
ON public.weight_entries(user_id, day_number);

-- ============================================================================
-- BACKFILL EXISTING DATA
-- ============================================================================

-- Backfill check_in_date from recorded_at for existing entries
UPDATE public.weight_entries
SET check_in_date = DATE(recorded_at)
WHERE check_in_date IS NULL;

-- Backfill day_number based on order of recorded_at per user
WITH numbered_entries AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY recorded_at) as entry_number
  FROM public.weight_entries
  WHERE day_number IS NULL
)
UPDATE public.weight_entries we
SET day_number = ne.entry_number
FROM numbered_entries ne
WHERE we.id = ne.id;

-- ============================================================================
-- ADD UNIQUE CONSTRAINT
-- ============================================================================

-- Ensure one weight entry per user per day
-- Drop if exists first
ALTER TABLE public.weight_entries
DROP CONSTRAINT IF EXISTS unique_user_check_in_date;

-- Add the constraint
ALTER TABLE public.weight_entries
ADD CONSTRAINT unique_user_check_in_date 
UNIQUE (user_id, check_in_date);

-- ============================================================================
-- VERIFICATION QUERIES (Run these to check)
-- ============================================================================

-- Check if columns exist
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'weight_entries' 
-- AND column_name IN ('check_in_date', 'day_number');

-- Check if data is backfilled
-- SELECT 
--   COUNT(*) as total_entries,
--   COUNT(check_in_date) as entries_with_check_in_date,
--   COUNT(day_number) as entries_with_day_number
-- FROM public.weight_entries;

-- View sample data
-- SELECT id, user_id, weight_kg, recorded_at, check_in_date, day_number
-- FROM public.weight_entries
-- ORDER BY user_id, recorded_at
-- LIMIT 20;

