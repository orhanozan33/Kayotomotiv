-- Supabase RLS Kontrol ve Düzeltme
-- Proje ID: rxbtkjihvqjmamdwmsev
-- RLS'yi kapat ve uyarıyı gider

-- ============================================
-- 1. RLS DURUMUNU KONTROL ET
-- ============================================

-- Tüm tabloların RLS durumunu kontrol et
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 2. RLS'Yİ KAPAT (TÜM TABLOLAR İÇİN)
-- ============================================

-- Users table
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

-- Vehicles table
ALTER TABLE IF EXISTS vehicles DISABLE ROW LEVEL SECURITY;

-- Vehicle images table
ALTER TABLE IF EXISTS vehicle_images DISABLE ROW LEVEL SECURITY;

-- Reservations table
ALTER TABLE IF EXISTS reservations DISABLE ROW LEVEL SECURITY;

-- Test drives table
ALTER TABLE IF EXISTS test_drives DISABLE ROW LEVEL SECURITY;

-- Repair services table
ALTER TABLE IF EXISTS repair_services DISABLE ROW LEVEL SECURITY;

-- Repair quotes table
ALTER TABLE IF EXISTS repair_quotes DISABLE ROW LEVEL SECURITY;

-- Repair appointments table
ALTER TABLE IF EXISTS repair_appointments DISABLE ROW LEVEL SECURITY;

-- Car wash packages table
ALTER TABLE IF EXISTS car_wash_packages DISABLE ROW LEVEL SECURITY;

-- Car wash addons table
ALTER TABLE IF EXISTS car_wash_addons DISABLE ROW LEVEL SECURITY;

-- Car wash appointments table
ALTER TABLE IF EXISTS car_wash_appointments DISABLE ROW LEVEL SECURITY;

-- Pages table
ALTER TABLE IF EXISTS pages DISABLE ROW LEVEL SECURITY;

-- Customers table
ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;

-- Customer vehicles table
ALTER TABLE IF EXISTS customer_vehicles DISABLE ROW LEVEL SECURITY;

-- Service records table
ALTER TABLE IF EXISTS service_records DISABLE ROW LEVEL SECURITY;

-- Settings table
ALTER TABLE IF EXISTS settings DISABLE ROW LEVEL SECURITY;

-- Company settings table
ALTER TABLE IF EXISTS company_settings DISABLE ROW LEVEL SECURITY;

-- Receipts table
ALTER TABLE IF EXISTS receipts DISABLE ROW LEVEL SECURITY;

-- Contact messages table
ALTER TABLE IF EXISTS contact_messages DISABLE ROW LEVEL SECURITY;

-- User permissions table
ALTER TABLE IF EXISTS user_permissions DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RLS DURUMUNU TEKRAR KONTROL ET
-- ============================================

-- Tüm tabloların RLS durumunu tekrar kontrol et
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = false THEN 'OK - RLS Kapali'
        WHEN rowsecurity = true THEN 'WARNING - RLS Acik'
        ELSE 'UNKNOWN'
    END as durum
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 4. PAGES TABLOSU ÖZEL KONTROL
-- ============================================

-- Pages tablosunun RLS durumunu özel olarak kontrol et
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = false THEN 'OK - RLS Kapali (Istedigimiz durum)'
        WHEN rowsecurity = true THEN 'WARNING - RLS Acik (Kapatilmali)'
        ELSE 'UNKNOWN'
    END as durum
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'pages';

-- ============================================
-- AÇIKLAMA
-- ============================================

-- NOT: Supabase'de "RLS has not been enabled" uyarısı görüyorsanız:
-- 1. Bu uyarı zararsızdır - RLS kapalı olduğu için görünüyor
-- 2. Backend kendi authentication'ını yönetiyor, RLS'ye ihtiyacımız yok
-- 3. Bu script'i çalıştırarak RLS'yi kesinlikle kapatabilirsiniz
-- 4. Uyarı devam ederse, Supabase Dashboard'dan manuel olarak da kapatabilirsiniz:
--    - Table Editor > pages tablosu > Settings > Row Level Security > Disable

