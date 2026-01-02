-- Fix vehicle_reservations table to match entity definition
-- Run this in Supabase SQL Editor if the table already exists

-- Drop existing table if it has wrong structure (CAREFUL: This will delete all data!)
-- DROP TABLE IF EXISTS "vehicle_reservations" CASCADE;

-- Or better: Alter existing table to add missing columns
ALTER TABLE "vehicle_reservations" 
  DROP COLUMN IF EXISTS "reservation_date",
  DROP COLUMN IF EXISTS "notes";

-- Add missing columns
ALTER TABLE "vehicle_reservations"
  ADD COLUMN IF NOT EXISTS "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "customer_name" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "customer_email" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "customer_phone" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "message" TEXT,
  ADD COLUMN IF NOT EXISTS "preferred_date" DATE,
  ADD COLUMN IF NOT EXISTS "preferred_time" TIME,
  ADD COLUMN IF NOT EXISTS "reservation_end_time" TIMESTAMP;

-- Make customer_name, customer_email, customer_phone NOT NULL if table is empty
-- (If table has data, you'll need to populate these fields first)
-- ALTER TABLE "vehicle_reservations"
--   ALTER COLUMN "customer_name" SET NOT NULL,
--   ALTER COLUMN "customer_email" SET NOT NULL,
--   ALTER COLUMN "customer_phone" SET NOT NULL;

-- Fix test_drive_requests table
ALTER TABLE "test_drive_requests" 
  DROP COLUMN IF EXISTS "requested_date",
  DROP COLUMN IF EXISTS "notes";

ALTER TABLE "test_drive_requests"
  ADD COLUMN IF NOT EXISTS "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "customer_name" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "customer_email" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "customer_phone" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "preferred_date" DATE,
  ADD COLUMN IF NOT EXISTS "preferred_time" TIME,
  ADD COLUMN IF NOT EXISTS "message" TEXT,
  ADD COLUMN IF NOT EXISTS "reservation_end_time" TIMESTAMP;

