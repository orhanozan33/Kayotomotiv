-- Supabase Seed Data Ekleme
-- Proje ID: rxbtkjihvqjmamdwmsev
-- Tabloları doldurmak için örnek veriler

-- ============================================
-- 1. ADMIN USER KONTROL VE EKLEME
-- ============================================

-- Admin user oluştur (eğer yoksa)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES (
    'admin@kayoto.com',
    '$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m', -- Password: admin123
    'Admin',
    'User',
    'admin',
    true
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. ÖRNEK ARAÇLAR (VEHICLES)
-- ============================================

INSERT INTO vehicles (brand, model, year, price, mileage, fuel_type, transmission, color, description, status)
VALUES 
    ('Toyota', 'Corolla', 2023, 250000.00, 15000, 'Benzin', 'Otomatik', 'Beyaz', 'Temiz, bakımlı araç. Tek elden.', 'available'),
    ('Honda', 'Civic', 2022, 280000.00, 20000, 'Benzin', 'Manuel', 'Siyah', 'Sıfır gibi araç. Garantili.', 'available'),
    ('Ford', 'Focus', 2021, 220000.00, 35000, 'Dizel', 'Otomatik', 'Gri', 'Ekonomik ve güvenilir.', 'available'),
    ('Volkswagen', 'Golf', 2023, 320000.00, 10000, 'Benzin', 'Otomatik', 'Kırmızı', 'Yeni model. Full donanım.', 'available'),
    ('Renault', 'Clio', 2022, 180000.00, 25000, 'Benzin', 'Manuel', 'Mavi', 'Şehir içi kullanım için ideal.', 'available')
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. ARAÇ RESİMLERİ (VEHICLE_IMAGES)
-- ============================================

-- İlk araç için resim ekle (eğer vehicles tablosunda veri varsa)
INSERT INTO vehicle_images (vehicle_id, image_url, is_primary, display_order)
SELECT 
    v.id,
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
    true,
    1
FROM vehicles v
WHERE v.brand = 'Toyota' AND v.model = 'Corolla' AND v.year = 2023
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. TAMİR SERVİSLERİ (REPAIR_SERVICES)
-- ============================================

INSERT INTO repair_services (name, description, price, is_active)
VALUES 
    ('Yağ Değişimi', 'Motor yağı ve yağ filtresi değişimi', 299.00, true),
    ('Fren Servisi', 'Fren balata değişimi ve fren sıvısı kontrolü', 899.00, true),
    ('Hava Filtresi Değişimi', 'Motor hava filtresi değişimi', 199.00, true),
    ('Akü Değişimi', 'Araç aküsü değişim servisi', 1299.00, true),
    ('Lastik Rotasyonu', 'Lastik rotasyonu ve basınç kontrolü', 149.00, true),
    ('Şanzıman Servisi', 'Şanzıman yağı değişimi', 899.00, true),
    ('Soğutma Sistemi Temizliği', 'Radyatör temizliği ve antifriz değişimi', 599.00, true),
    ('Timing Kayışı Değişimi', 'Timing kayışı değişim servisi', 2499.00, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. OTO YIKAMA PAKETLERİ (CAR_WASH_PACKAGES)
-- ============================================

INSERT INTO car_wash_packages (name, description, price, duration_minutes, is_active)
VALUES 
    ('Temel Yıkama', 'Dış yıkama ve kurulama', 79.00, 15, true),
    ('Standart Yıkama', 'Dış yıkama, kurulama, lastik parlatma ve iç süpürme', 149.00, 30, true),
    ('Premium Yıkama', 'Tam dış yıkama, cila, iç temizlik, lastik parlatma', 249.00, 60, true),
    ('Deluxe Yıkama', 'Komple detay: dış, iç, cila, parlatma, motor bölmesi', 499.00, 120, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. OTO YIKAMA EKSTRALARI (CAR_WASH_ADDONS)
-- ============================================

INSERT INTO car_wash_addons (name, description, price, is_active)
VALUES 
    ('İç Detay', 'Derinlemesine iç temizlik ve koruma', 199.00, true),
    ('Cila Koruması', 'Premium cila uygulaması', 149.00, true),
    ('Motor Bölmesi Temizliği', 'Motor bölmesi temizlik servisi', 99.00, true),
    ('Far Restorasyonu', 'Far temizliği ve parlatma', 149.00, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. SAYFALAR (PAGES)
-- ============================================

INSERT INTO pages (slug, title, content, meta_description, is_active)
VALUES 
    ('hakkimizda', 'Hakkımızda', 'Oto tamir, satış ve yıkama hizmetleri sunan kaliteli bir otomotiv merkezine hoş geldiniz.', 'Hakkımızda bilgiler', true),
    ('iletisim', 'İletişim', 'Herhangi bir sorunuz için bizimle iletişime geçebilirsiniz.', 'İletişim bilgileri', true),
    ('hizmetlerimiz', 'Hizmetlerimiz', 'Oto tamir, satış ve yıkama hizmetlerimiz hakkında bilgi alın.', 'Hizmetlerimiz', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- TAMAMLANDI!
-- ============================================

