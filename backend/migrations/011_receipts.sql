-- Create receipts table to store printed receipts
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    service_record_id UUID, -- Reference to service_records table (can be null for historical data)
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    license_plate VARCHAR(50), -- Store license plate for easy search
    service_name TEXT NOT NULL,
    service_description TEXT,
    service_type VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    performed_date DATE NOT NULL,
    company_info JSONB, -- Store company info at time of printing
    printed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for search functionality
CREATE INDEX IF NOT EXISTS idx_receipts_customer_id ON receipts(customer_id);
CREATE INDEX IF NOT EXISTS idx_receipts_customer_name ON receipts(customer_name);
CREATE INDEX IF NOT EXISTS idx_receipts_customer_phone ON receipts(customer_phone);
CREATE INDEX IF NOT EXISTS idx_receipts_license_plate ON receipts(license_plate);
CREATE INDEX IF NOT EXISTS idx_receipts_printed_at ON receipts(printed_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_service_type ON receipts(service_type);

