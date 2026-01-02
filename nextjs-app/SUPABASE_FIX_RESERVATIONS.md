# 🔧 Supabase vehicle_reservations Tablosunu Düzeltme

## ❌ Sorun

Rezervasyon talebinde hata alıyorsunuz çünkü `vehicle_reservations` tablosu eski yapıda. Tablo var ama gerekli sütunlar eksik.

## ✅ Çözüm: Tabloyu Güncelle

### ADIM 1: Supabase Dashboard'a Git

1. [Supabase Dashboard](https://supabase.com/dashboard) → Projenizi seçin
2. Sol menüden **SQL Editor**'a tıklayın

### ADIM 2: SQL Script'i Çalıştır

1. **New Query** butonuna tıklayın
2. Aşağıdaki SQL kodunu kopyalayıp yapıştırın:

```sql
-- Fix vehicle_reservations table to match entity definition
-- Eksik sütunları ekle

ALTER TABLE "vehicle_reservations" 
  DROP COLUMN IF EXISTS "reservation_date",
  DROP COLUMN IF EXISTS "notes";

-- Eksik sütunları ekle
ALTER TABLE "vehicle_reservations"
  ADD COLUMN IF NOT EXISTS "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "customer_name" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "customer_email" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "customer_phone" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "message" TEXT,
  ADD COLUMN IF NOT EXISTS "preferred_date" DATE,
  ADD COLUMN IF NOT EXISTS "preferred_time" TIME,
  ADD COLUMN IF NOT EXISTS "reservation_end_time" TIMESTAMP;

-- Eğer tabloda veri yoksa, NOT NULL constraint ekle
-- (Eğer veri varsa, önce verileri doldurmanız gerekir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "vehicle_reservations" LIMIT 1) THEN
    ALTER TABLE "vehicle_reservations"
      ALTER COLUMN "customer_name" SET NOT NULL,
      ALTER COLUMN "customer_email" SET NOT NULL,
      ALTER COLUMN "customer_phone" SET NOT NULL;
  END IF;
END $$;
```

3. **RUN** butonuna tıklayın (veya Ctrl+Enter)
4. Başarılı mesajını bekleyin: `Success. No rows returned`

### ADIM 3: Tabloyu Kontrol Et

1. Sol menüden **Table Editor** → **vehicle_reservations**'a gidin
2. Tablonun şu sütunlara sahip olduğunu kontrol edin:
   - ✅ `id`
   - ✅ `vehicle_id`
   - ✅ `user_id`
   - ✅ `customer_id`
   - ✅ `customer_name`
   - ✅ `customer_email`
   - ✅ `customer_phone`
   - ✅ `message`
   - ✅ `preferred_date`
   - ✅ `preferred_time`
   - ✅ `status`
   - ✅ `reservation_end_time`
   - ✅ `created_at`
   - ✅ `updated_at`

### ADIM 4: Test Et

1. Vercel'de sayfayı yenileyin
2. Oto galeri sayfasından bir araç seçin
3. Rezervasyon formunu doldurup gönderin
4. Artık hata almamalısınız! ✅

## 🔍 Alternatif: Tabloyu Yeniden Oluştur (Veri Yoksa)

Eğer `vehicle_reservations` tablosunda veri yoksa, tabloyu tamamen yeniden oluşturabilirsiniz:

```sql
-- DİKKAT: Bu tüm verileri siler!
DROP TABLE IF EXISTS "vehicle_reservations" CASCADE;

-- Yeni tabloyu oluştur
CREATE TABLE "vehicle_reservations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "vehicle_id" UUID REFERENCES "vehicles"("id") ON DELETE CASCADE,
    "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "customer_id" UUID REFERENCES "customers"("id") ON DELETE SET NULL,
    "customer_name" VARCHAR(200) NOT NULL,
    "customer_email" VARCHAR(255) NOT NULL,
    "customer_phone" VARCHAR(20) NOT NULL,
    "message" TEXT,
    "preferred_date" DATE,
    "preferred_time" TIME,
    "status" VARCHAR(50) DEFAULT 'pending',
    "reservation_end_time" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📝 Notlar

- `fix-vehicle-reservations-table.sql` dosyası proje kök dizininde mevcut
- Eğer tabloda veri varsa, önce verileri yedekleyin
- `ALTER TABLE` komutları mevcut verileri korur

