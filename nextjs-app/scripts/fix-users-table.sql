-- Fix users table: Remove null emails and set email column to NOT NULL
-- Run this script directly in PostgreSQL

-- Step 1: Delete users with null emails (invalid records)
DELETE FROM users WHERE email IS NULL;

-- Step 2: Make email column NOT NULL (if it's not already)
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Step 3: Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;







