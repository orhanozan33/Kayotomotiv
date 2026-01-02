-- ============================================
-- SUPABASE SCHEMA FIX
-- Eksik kolonları eklemek için bu SQL'i çalıştır
-- ============================================

-- Fix car_wash_packages table
ALTER TABLE "car_wash_packages" 
  DROP COLUMN IF EXISTS "price",
  ADD COLUMN IF NOT EXISTS "base_price" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "display_order" INTEGER DEFAULT 0;

-- If price column exists, copy data to base_price before dropping
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'car_wash_packages' AND column_name = 'price') THEN
    UPDATE "car_wash_packages" SET "base_price" = "price" WHERE "base_price" = 0;
  END IF;
END $$;

-- Fix car_wash_addons table
ALTER TABLE "car_wash_addons"
  ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "display_order" INTEGER DEFAULT 0;

-- Fix car_wash_appointments table
ALTER TABLE "car_wash_appointments"
  ADD COLUMN IF NOT EXISTS "user_id" UUID REFERENCES "users"("id"),
  ADD COLUMN IF NOT EXISTS "customer_name" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "customer_email" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "customer_phone" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "package_name" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "package_price" DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "vehicle_brand" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "vehicle_model" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "addon_ids" JSONB,
  ADD COLUMN IF NOT EXISTS "appointment_time" TIME;

-- Update existing records if needed
UPDATE "car_wash_appointments" 
SET 
  "customer_name" = COALESCE("customer_name", 'Customer'),
  "customer_email" = COALESCE("customer_email", 'customer@example.com'),
  "customer_phone" = COALESCE("customer_phone", ''),
  "package_name" = COALESCE("package_name", 'Package'),
  "package_price" = COALESCE("package_price", 0),
  "appointment_time" = COALESCE("appointment_time", '10:00:00')
WHERE "customer_name" IS NULL OR "customer_email" IS NULL;

-- Make required columns NOT NULL after updating
ALTER TABLE "car_wash_appointments"
  ALTER COLUMN "customer_name" SET NOT NULL,
  ALTER COLUMN "customer_email" SET NOT NULL,
  ALTER COLUMN "customer_phone" SET NOT NULL,
  ALTER COLUMN "package_name" SET NOT NULL,
  ALTER COLUMN "package_price" SET NOT NULL,
  ALTER COLUMN "appointment_date" TYPE DATE USING "appointment_date"::DATE,
  ALTER COLUMN "appointment_time" SET NOT NULL,
  ALTER COLUMN "total_price" SET NOT NULL;

-- Success message
SELECT 'Schema fixes applied successfully!' AS message;

