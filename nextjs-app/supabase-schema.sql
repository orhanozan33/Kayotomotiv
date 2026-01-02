-- ============================================
-- KAYOTOMOTIV DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "phone" VARCHAR(50),
    "role" VARCHAR(50) DEFAULT 'customer',
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "user_permissions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
    "permission" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- VEHICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "vehicles" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "brand" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "year" INTEGER NOT NULL,
    "price" DECIMAL(10, 2) NOT NULL,
    "mileage" INTEGER,
    "fuel_type" VARCHAR(50) NOT NULL,
    "transmission" VARCHAR(50) NOT NULL,
    "color" VARCHAR(50),
    "description" TEXT,
    "status" VARCHAR(50) DEFAULT 'available',
    "featured" BOOLEAN DEFAULT false,
    "reservation_end_time" TIMESTAMP,
    "created_by" VARCHAR(255),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- VEHICLE IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "vehicle_images" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "vehicle_id" UUID REFERENCES "vehicles"("id") ON DELETE CASCADE,
    "image_url" VARCHAR(500) NOT NULL,
    "is_primary" BOOLEAN DEFAULT false,
    "display_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "customers" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) UNIQUE,
    "phone" VARCHAR(20),
    "address" TEXT,
    "vehicle_brand" VARCHAR(100),
    "vehicle_model" VARCHAR(100),
    "vehicle_year" INTEGER,
    "license_plate" VARCHAR(20),
    "notes" TEXT,
    "total_spent" DECIMAL(12, 2) DEFAULT 0,
    "created_by" UUID REFERENCES "users"("id"),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CUSTOMER VEHICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "customer_vehicles" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "customer_id" UUID REFERENCES "customers"("id") ON DELETE CASCADE,
    "vehicle_id" UUID REFERENCES "vehicles"("id") ON DELETE CASCADE,
    "license_plate" VARCHAR(50),
    "vin" VARCHAR(100),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SERVICE RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "service_records" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "customer_id" UUID REFERENCES "customers"("id") ON DELETE CASCADE,
    "vehicle_id" UUID REFERENCES "customer_vehicles"("id") ON DELETE CASCADE,
    "service_type" VARCHAR(100) NOT NULL,
    "service_name" VARCHAR(200) NOT NULL,
    "service_description" TEXT,
    "price" DECIMAL(10, 2) NOT NULL,
    "performed_date" DATE NOT NULL,
    "performed_by" UUID REFERENCES "users"("id"),
    "notes" TEXT,
    "quote_id" UUID,
    "appointment_id" UUID,
    "car_wash_appointment_id" UUID,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REPAIR SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "repair_services" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100),
    "base_price" DECIMAL(10, 2),
    "is_active" BOOLEAN DEFAULT true,
    "display_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REPAIR SERVICE PRICING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "repair_service_pricing" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "service_id" UUID REFERENCES "repair_services"("id") ON DELETE CASCADE,
    "vehicle_type" VARCHAR(100),
    "price" DECIMAL(10, 2) NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REPAIR QUOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "repair_quotes" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "users"("id"),
    "customer_id" UUID REFERENCES "customers"("id"),
    "customer_name" VARCHAR(200) NOT NULL,
    "customer_email" VARCHAR(255) NOT NULL,
    "customer_phone" VARCHAR(20) NOT NULL,
    "vehicle_brand" VARCHAR(100) NOT NULL,
    "vehicle_model" VARCHAR(100) NOT NULL,
    "vehicle_year" INTEGER NOT NULL,
    "license_plate" VARCHAR(20),
    "services_data" JSONB,
    "total_price" DECIMAL(10, 2),
    "status" VARCHAR(50) DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REPAIR QUOTE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "repair_quote_items" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "quote_id" UUID REFERENCES "repair_quotes"("id") ON DELETE CASCADE,
    "service_id" UUID REFERENCES "repair_services"("id") ON DELETE CASCADE,
    "quantity" INTEGER DEFAULT 1,
    "price" DECIMAL(10, 2) NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REPAIR APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "repair_appointments" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "customer_id" UUID REFERENCES "customers"("id") ON DELETE CASCADE,
    "vehicle_id" UUID REFERENCES "vehicles"("id") ON DELETE CASCADE,
    "service_id" UUID REFERENCES "repair_services"("id") ON DELETE CASCADE,
    "appointment_date" TIMESTAMP NOT NULL,
    "status" VARCHAR(50) DEFAULT 'scheduled',
    "notes" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CAR WASH PACKAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "car_wash_packages" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "base_price" DECIMAL(10, 2) NOT NULL,
    "duration_minutes" INTEGER,
    "is_active" BOOLEAN DEFAULT true,
    "display_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CAR WASH ADDONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "car_wash_addons" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10, 2) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "display_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CAR WASH APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "car_wash_appointments" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "users"("id"),
    "customer_id" UUID REFERENCES "customers"("id") ON DELETE CASCADE,
    "customer_name" VARCHAR(200) NOT NULL,
    "customer_email" VARCHAR(255) NOT NULL,
    "customer_phone" VARCHAR(20) NOT NULL,
    "package_id" UUID REFERENCES "car_wash_packages"("id") ON DELETE CASCADE,
    "package_name" VARCHAR(200) NOT NULL,
    "package_price" DECIMAL(10, 2) NOT NULL,
    "vehicle_brand" VARCHAR(100),
    "vehicle_model" VARCHAR(100),
    "addon_ids" JSONB,
    "appointment_date" DATE NOT NULL,
    "appointment_time" TIME NOT NULL,
    "total_price" DECIMAL(10, 2) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CAR WASH APPOINTMENT ADDONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "car_wash_appointment_addons" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "appointment_id" UUID REFERENCES "car_wash_appointments"("id") ON DELETE CASCADE,
    "addon_id" UUID REFERENCES "car_wash_addons"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- VEHICLE RESERVATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "vehicle_reservations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "vehicle_id" UUID REFERENCES "vehicles"("id") ON DELETE CASCADE,
    "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "customer_id" UUID REFERENCES "customers"("id") ON DELETE SET NULL,
    "customer_name" VARCHAR(200) NOT NULL,
    "customer_email" VARCHAR(255) NOT NULL,
    "customer_phone" VARCHAR(20) NOT NULL,
    "message" TEXT,
    "preferred_date" DATE,
    "preferred_time" TIME,
    "status" VARCHAR(50) DEFAULT 'pending',
    "reservation_end_time" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TEST DRIVE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "test_drive_requests" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "vehicle_id" UUID REFERENCES "vehicles"("id") ON DELETE CASCADE,
    "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "customer_id" UUID REFERENCES "customers"("id") ON DELETE SET NULL,
    "customer_name" VARCHAR(200) NOT NULL,
    "customer_email" VARCHAR(255) NOT NULL,
    "customer_phone" VARCHAR(20) NOT NULL,
    "preferred_date" DATE,
    "preferred_time" TIME,
    "message" TEXT,
    "status" VARCHAR(50) DEFAULT 'pending',
    "reservation_end_time" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- RECEIPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "receipts" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "customer_id" UUID REFERENCES "customers"("id") ON DELETE CASCADE,
    "service_type" VARCHAR(100),
    "amount" DECIMAL(10, 2) NOT NULL,
    "payment_method" VARCHAR(50),
    "company_logo_url" VARCHAR(500),
    "receipt_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CONTACT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "contact_messages" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "subject" VARCHAR(255),
    "message" TEXT NOT NULL,
    "status" VARCHAR(50) DEFAULT 'unread',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "settings" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "key" VARCHAR(255) UNIQUE NOT NULL,
    "value" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "pages" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "slug" VARCHAR(200) UNIQUE NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT,
    "meta_description" VARCHAR(500),
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID REFERENCES "users"("id"),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS "idx_vehicles_status" ON "vehicles"("status");
CREATE INDEX IF NOT EXISTS "idx_vehicle_images_vehicle_id" ON "vehicle_images"("vehicle_id");
CREATE INDEX IF NOT EXISTS "idx_customer_vehicles_customer_id" ON "customer_vehicles"("customer_id");
CREATE INDEX IF NOT EXISTS "idx_service_records_customer_id" ON "service_records"("customer_id");
CREATE INDEX IF NOT EXISTS "idx_repair_quotes_customer_id" ON "repair_quotes"("customer_id");
CREATE INDEX IF NOT EXISTS "idx_repair_appointments_date" ON "repair_appointments"("appointment_date");
CREATE INDEX IF NOT EXISTS "idx_car_wash_appointments_date" ON "car_wash_appointments"("appointment_date");
CREATE INDEX IF NOT EXISTS "idx_contact_messages_status" ON "contact_messages"("status");
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Database schema created successfully!' AS message;

