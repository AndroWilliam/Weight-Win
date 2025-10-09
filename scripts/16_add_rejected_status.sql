-- Add 'rejected' to application_status enum
-- This script adds the rejected status to the existing application_status enum

-- Add 'rejected' to application_status enum
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'rejected';

-- Verify the enum values
SELECT unnest(enum_range(NULL::application_status)) as status_values;

-- Note: No additional constraints or triggers needed
-- The existing RLS policies will automatically handle the new 'rejected' status
-- since they use generic status checks
