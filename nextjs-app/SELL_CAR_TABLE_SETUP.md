# 📋 Sell Car Submissions Tablosu Kurulumu

## ❌ Sorun
`Database schema not initialized` hatası alıyorsunuz çünkü `sell_car_submissions` tablosu henüz oluşturulmamış.

## ✅ Çözüm: Tabloyu Oluştur

### ADIM 1: Supabase SQL Editor'e Git

1. **Supabase Dashboard**: https://supabase.com/dashboard
2. Projeni seç: **kayotomotiv**
3. Sol menüden **SQL Editor**'e tıkla
4. **New query** butonuna tıkla

### ADIM 2: SQL'i Çalıştır

Aşağıdaki SQL kodunu kopyala ve SQL Editor'e yapıştır, sonra **RUN** butonuna tıkla:

```sql
-- ============================================
-- SELL CAR SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "sell_car_submissions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "brand" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "year" INTEGER NOT NULL,
    "transmission" VARCHAR(50) NOT NULL,
    "fuel_type" VARCHAR(50) NOT NULL,
    "customer_name" VARCHAR(255) NOT NULL,
    "customer_email" VARCHAR(255) NOT NULL,
    "customer_phone" VARCHAR(50) NOT NULL,
    "notes" TEXT,
    "images" TEXT, -- JSON array of image URLs
    "status" VARCHAR(50) DEFAULT 'unread',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_sell_car_submissions_status" ON "sell_car_submissions"("status");
CREATE INDEX IF NOT EXISTS "idx_sell_car_submissions_created_at" ON "sell_car_submissions"("created_at");
```

### ADIM 3: Başarıyı Kontrol Et

SQL çalıştıktan sonra:
1. "Success. No rows returned" mesajını görmelisiniz
2. Sol menüden **Table Editor**'e gidin
3. **sell_car_submissions** tablosunu görebilmelisiniz

---

## ✅ Tamamlandı!

Artık araç satış formu çalışmalı. Kullanıcılar formu doldurabilir ve admin panelde mesajlar sayfasında görüntüleyebilirsiniz.
