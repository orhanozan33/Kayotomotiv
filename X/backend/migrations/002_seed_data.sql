-- Seed Data for Initial Setup

-- Create default admin user (email: admin@gmail.com, password: 33333333)
-- NOTE: The password hash below is for '33333333'
-- This hash is valid for password '33333333'
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@gmail.com', '$2a$10$dS3A5VdyubEHGSnI5ITF2OL/CHYP4qDFna6.RMOv9SuWg4/9tJifa', 'Admin', 'User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Sample Repair Services
INSERT INTO repair_services (name, description, category, base_price, display_order) VALUES
('Oil Change', 'Engine oil and oil filter replacement', 'Maintenance', 299.00, 1),
('Brake Service', 'Brake pad replacement and brake fluid check', 'Safety', 899.00, 2),
('Air Filter Replacement', 'Engine air filter replacement', 'Maintenance', 199.00, 3),
('Battery Replacement', 'Car battery replacement service', 'Electrical', 1299.00, 4),
('Tire Rotation', 'Tire rotation and pressure check', 'Maintenance', 149.00, 5),
('Transmission Service', 'Transmission fluid change', 'Maintenance', 899.00, 6),
('Coolant Flush', 'Coolant system flush and refill', 'Maintenance', 599.00, 7),
('Timing Belt Replacement', 'Timing belt replacement service', 'Engine', 2499.00, 8)
ON CONFLICT DO NOTHING;

-- Sample Car Wash Packages
INSERT INTO car_wash_packages (name, description, base_price, duration_minutes, display_order) VALUES
('Basic Wash', 'Exterior wash and dry', 79.00, 15, 1),
('Standard Wash', 'Exterior wash, dry, tire shine, and interior vacuum', 149.00, 30, 2),
('Premium Wash', 'Full exterior wash, wax, interior cleaning, tire shine', 249.00, 60, 3),
('Deluxe Wash', 'Complete detailing: exterior, interior, wax, polish, engine bay', 499.00, 120, 4)
ON CONFLICT DO NOTHING;

-- Sample Car Wash Add-ons
INSERT INTO car_wash_addons (name, description, price, display_order) VALUES
('Interior Detailing', 'Deep interior cleaning and protection', 199.00, 1),
('Wax Protection', 'Premium wax application', 149.00, 2),
('Engine Bay Cleaning', 'Engine compartment cleaning', 99.00, 3),
('Headlight Restoration', 'Headlight cleaning and polishing', 149.00, 4)
ON CONFLICT DO NOTHING;

-- Sample Pages
INSERT INTO pages (slug, title, content, meta_description) VALUES
('about', 'About Us', 'Welcome to our automotive service center. We provide quality auto repair, sales, and car wash services.', 'Learn about our automotive services'),
('contact', 'Contact Us', 'Get in touch with us for any inquiries.', 'Contact information')
ON CONFLICT (slug) DO NOTHING;

