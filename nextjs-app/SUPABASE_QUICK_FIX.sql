-- ============================================
-- QUICK FIX: vehicle_reservations Tablosunu Güncelle
-- ============================================
-- Bu script'i Supabase SQL Editor'da çalıştırın
-- Tüm eksik sütunları ekler, mevcut verileri korur

-- Eski sütunları kaldır (eğer varsa)
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

-- Başarı mesajı
SELECT '✅ vehicle_reservations tablosu başarıyla güncellendi!' as result;

