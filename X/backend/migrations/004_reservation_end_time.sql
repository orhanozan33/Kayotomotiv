-- Add preferred_date and preferred_time to vehicle_reservations table
ALTER TABLE vehicle_reservations 
ADD COLUMN IF NOT EXISTS preferred_date DATE,
ADD COLUMN IF NOT EXISTS preferred_time TIME;

-- Add reservation_end_time to vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS reservation_end_time TIMESTAMP;

-- Add reservation_end_time to vehicle_reservations table
ALTER TABLE vehicle_reservations 
ADD COLUMN IF NOT EXISTS reservation_end_time TIMESTAMP;

-- Add reservation_end_time to test_drive_requests table
ALTER TABLE test_drive_requests 
ADD COLUMN IF NOT EXISTS reservation_end_time TIMESTAMP;

