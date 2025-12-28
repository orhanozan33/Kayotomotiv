-- Add license_plate column to repair_quotes table
ALTER TABLE repair_quotes
ADD COLUMN IF NOT EXISTS license_plate VARCHAR(20);

-- Add an index for faster lookups by license_plate
CREATE INDEX IF NOT EXISTS idx_repair_quotes_license_plate ON repair_quotes(license_plate);

