-- Customer Management Schema Enhancement
-- Adds customers table and service records for tracking customer history

-- ============================================
-- CUSTOMERS TABLE
-- ============================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    vehicle_brand VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year INTEGER,
    notes TEXT,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(last_name, first_name);

-- ============================================
-- CUSTOMER VEHICLES (One customer can have multiple vehicles)
-- ============================================

CREATE TABLE customer_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER,
    license_plate VARCHAR(50),
    vin VARCHAR(50),
    color VARCHAR(50),
    mileage INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_vehicles_customer_id ON customer_vehicles(customer_id);

-- ============================================
-- SERVICE RECORDS (Track services performed for customers)
-- ============================================

CREATE TABLE service_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES customer_vehicles(id),
    service_type VARCHAR(100) NOT NULL, -- 'repair', 'car_wash', 'sale', etc.
    service_name VARCHAR(200) NOT NULL,
    service_description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    performed_date DATE NOT NULL,
    performed_by UUID REFERENCES users(id),
    notes TEXT,
    quote_id UUID REFERENCES repair_quotes(id),
    appointment_id UUID REFERENCES repair_appointments(id),
    car_wash_appointment_id UUID REFERENCES car_wash_appointments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_records_customer_id ON service_records(customer_id);
CREATE INDEX idx_service_records_performed_date ON service_records(performed_date);
CREATE INDEX idx_service_records_service_type ON service_records(service_type);

-- ============================================
-- LINK EXISTING TABLES TO CUSTOMERS
-- ============================================

-- Add customer_id to vehicle_reservations
ALTER TABLE vehicle_reservations 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

CREATE INDEX IF NOT EXISTS idx_vehicle_reservations_customer_id ON vehicle_reservations(customer_id);

-- Add customer_id to test_drive_requests
ALTER TABLE test_drive_requests 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

CREATE INDEX IF NOT EXISTS idx_test_drive_requests_customer_id ON test_drive_requests(customer_id);

-- Add customer_id to repair_quotes
ALTER TABLE repair_quotes 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

CREATE INDEX IF NOT EXISTS idx_repair_quotes_customer_id ON repair_quotes(customer_id);

-- Add customer_id to repair_appointments
ALTER TABLE repair_appointments 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

CREATE INDEX IF NOT EXISTS idx_repair_appointments_customer_id ON repair_appointments(customer_id);

-- Add customer_id to car_wash_appointments
ALTER TABLE car_wash_appointments 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

CREATE INDEX IF NOT EXISTS idx_car_wash_appointments_customer_id ON car_wash_appointments(customer_id);

-- ============================================
-- FUNCTION TO UPDATE CUSTOMER TOTAL SPENT
-- ============================================

CREATE OR REPLACE FUNCTION update_customer_total_spent()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE customers
    SET total_spent = (
        SELECT COALESCE(SUM(price), 0)
        FROM service_records
        WHERE customer_id = NEW.customer_id
    )
    WHERE id = NEW.customer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_total_spent_trigger
AFTER INSERT OR UPDATE OR DELETE ON service_records
FOR EACH ROW
EXECUTE FUNCTION update_customer_total_spent();

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_vehicles_updated_at BEFORE UPDATE ON customer_vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_records_updated_at BEFORE UPDATE ON service_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


