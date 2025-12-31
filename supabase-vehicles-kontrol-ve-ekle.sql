-- Supabase Vehicles Tablosu Kontrol ve Veri Ekleme
-- Proje ID: rxbtkjihvqjmamdwmsev

-- ============================================
-- 1. VEHICLES TABLOSU KONTROL
-- ============================================

-- Mevcut araçları listele
SELECT 
    id,
    brand,
    model,
    year,
    price,
    status,
    created_at
FROM vehicles
ORDER BY created_at DESC
LIMIT 20;

-- Araç sayısını kontrol et
SELECT COUNT(*) as total_vehicles FROM vehicles;

-- ============================================
-- 2. VEHICLE_IMAGES TABLOSU KONTROL
-- ============================================

-- Araç resimlerini listele
SELECT 
    vi.id,
    vi.vehicle_id,
    v.brand || ' ' || v.model as vehicle_name,
    vi.image_url,
    vi.is_primary,
    vi.display_order
FROM vehicle_images vi
JOIN vehicles v ON vi.vehicle_id = v.id
ORDER BY vi.vehicle_id, vi.display_order
LIMIT 20;

-- Resim sayısını kontrol et
SELECT COUNT(*) as total_images FROM vehicle_images;

-- ============================================
-- 3. ÖRNEK ARAÇLAR EKLE (EĞER YOKSA)
-- ============================================

-- Örnek araçlar ekle (eğer tablo boşsa)
INSERT INTO vehicles (brand, model, year, price, mileage, fuel_type, transmission, color, description, status)
SELECT 
    'Toyota', 'Corolla', 2023, 250000.00, 15000, 'Benzin', 'Otomatik', 'Beyaz', 'Temiz, bakımlı araç. Tek elden.', 'available'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE brand = 'Toyota' AND model = 'Corolla' AND year = 2023)
UNION ALL
SELECT 
    'Honda', 'Civic', 2022, 280000.00, 20000, 'Benzin', 'Manuel', 'Siyah', 'Sıfır gibi araç. Garantili.', 'available'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE brand = 'Honda' AND model = 'Civic' AND year = 2022)
UNION ALL
SELECT 
    'Ford', 'Focus', 2021, 220000.00, 35000, 'Dizel', 'Otomatik', 'Gri', 'Ekonomik ve güvenilir.', 'available'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE brand = 'Ford' AND model = 'Focus' AND year = 2021)
UNION ALL
SELECT 
    'Volkswagen', 'Golf', 2023, 320000.00, 10000, 'Benzin', 'Otomatik', 'Kırmızı', 'Yeni model. Full donanım.', 'available'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE brand = 'Volkswagen' AND model = 'Golf' AND year = 2023)
UNION ALL
SELECT 
    'Renault', 'Clio', 2022, 180000.00, 25000, 'Benzin', 'Manuel', 'Mavi', 'Şehir içi kullanım için ideal.', 'available'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE brand = 'Renault' AND model = 'Clio' AND year = 2022);

-- ============================================
-- 4. ARAÇ RESİMLERİ EKLE (EĞER YOKSA)
-- ============================================

-- İlk araç için resim ekle
INSERT INTO vehicle_images (vehicle_id, image_url, is_primary, display_order)
SELECT 
    v.id,
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
    true,
    1
FROM vehicles v
WHERE v.brand = 'Toyota' AND v.model = 'Corolla' AND v.year = 2023
AND NOT EXISTS (
    SELECT 1 FROM vehicle_images vi 
    WHERE vi.vehicle_id = v.id AND vi.is_primary = true
)
LIMIT 1;

-- İkinci araç için resim ekle
INSERT INTO vehicle_images (vehicle_id, image_url, is_primary, display_order)
SELECT 
    v.id,
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
    true,
    1
FROM vehicles v
WHERE v.brand = 'Honda' AND v.model = 'Civic' AND v.year = 2022
AND NOT EXISTS (
    SELECT 1 FROM vehicle_images vi 
    WHERE vi.vehicle_id = v.id AND vi.is_primary = true
)
LIMIT 1;

-- ============================================
-- 5. KONTROL
-- ============================================

-- Araç sayısını tekrar kontrol et
SELECT COUNT(*) as total_vehicles FROM vehicles;

-- Resim sayısını tekrar kontrol et
SELECT COUNT(*) as total_images FROM vehicle_images;

-- Araçları ve resimlerini listele
SELECT 
    v.id,
    v.brand,
    v.model,
    v.year,
    v.price,
    v.status,
    COUNT(vi.id) as image_count
FROM vehicles v
LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
GROUP BY v.id, v.brand, v.model, v.year, v.price, v.status
ORDER BY v.created_at DESC;

