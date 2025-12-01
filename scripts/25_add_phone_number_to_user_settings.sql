-- Add phone_number column to user_settings table
-- This is for Phase 2 of BOLD Soccer partnership
-- Stores Egyptian phone numbers in format: +20XXXXXXXXX

-- Add phone_number column
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Add comment
COMMENT ON COLUMN user_settings.phone_number IS 'User phone number for BOLD Soccer partnership (Egyptian format: +20 followed by 9 digits)';

-- Note: No constraint added to allow NULL values (phone number is optional)
-- Validation is handled in application layer (API route)
