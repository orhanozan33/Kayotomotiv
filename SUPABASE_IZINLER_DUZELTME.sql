-- ============================================
-- SUPABASE İZİNLERİNİ DÜZELTME
-- RLS (Row Level Security) kapatma
-- ============================================

-- Tüm tablolarda RLS'yi kapat
-- (Backend uygulaması kendi JWT authentication kullanıyor)

ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicle_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS test_drives DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS repair_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS repair_quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS repair_appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS car_wash_packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS car_wash_addons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS car_wash_appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pages DISABLE ROW LEVEL SECURITY;

-- Eğer başka tablolar varsa onları da ekleyin
-- Örnek: ALTER TABLE IF EXISTS settings DISABLE ROW LEVEL SECURITY;

SELECT 'RLS (Row Level Security) tum tablolarda kapatildi.' AS status;

