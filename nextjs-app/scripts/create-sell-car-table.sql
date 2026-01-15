-- ============================================
-- SELL CAR SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "sell_car_submissions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "brand" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "year" INTEGER NOT NULL,
    "transmission" VARCHAR(50) NOT NULL,
    "fuel_type" VARCHAR(50) NOT NULL,
    "mileage" INTEGER,
    "customer_name" VARCHAR(255) NOT NULL,
    "customer_email" VARCHAR(255) NOT NULL,
    "customer_phone" VARCHAR(50) NOT NULL,
    "notes" TEXT,
    "images" TEXT, -- JSON array of image URLs
    "status" VARCHAR(50) DEFAULT 'unread',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS "idx_sell_car_submissions_status" ON "sell_car_submissions"("status");
CREATE INDEX IF NOT EXISTS "idx_sell_car_submissions_created_at" ON "sell_car_submissions"("created_at");
