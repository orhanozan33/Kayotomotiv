-- Add vehicle_brand and vehicle_model to car_wash_appointments table
ALTER TABLE car_wash_appointments
ADD COLUMN IF NOT EXISTS vehicle_brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS vehicle_model VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_car_wash_appointments_vehicle_brand ON car_wash_appointments(vehicle_brand);

