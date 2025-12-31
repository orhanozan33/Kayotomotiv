-- Add license_plate column to customers table for vehicle identification

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS license_plate VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_customers_license_plate ON customers(license_plate);

