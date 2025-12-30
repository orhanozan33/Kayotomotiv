# Next.js Migration - Durum

## ✅ Yapılanlar

1. **Next.js projesi oluşturuldu**
   - `package.json` - Next.js dependencies
   - `next.config.js` - Next.js configuration
   - `tsconfig.json` - TypeScript configuration

2. **Database connection**
   - `lib/db.ts` - PostgreSQL connection pool

3. **API Routes başlangıcı**
   - `app/api/route.ts` - Root API endpoint
   - `app/api/health/route.ts` - Health check
   - `app/api/auth/login/route.ts` - Login endpoint (başlangıç)

4. **Models**
   - `lib/models/User.ts` - User model

## ⏳ Yapılacaklar

1. Tüm Express route'larını Next.js API route'larına çevir
2. Frontend'i Next.js'e taşı
3. Backoffice'i `/app/admin` altına taşı
4. Middleware'leri Next.js middleware'e çevir

## ⚠️ ÖNEMLİ

Bu migration büyük bir iş. Tüm route'ları çevirmek gerekiyor.

**Seçenekler:**
1. **Tam migration** - Tüm route'ları çevir (2-3 saat)
2. **Aşamalı migration** - Önce kritik route'ları çevir, sonra diğerleri
3. **Mevcut yapıyı düzelt** - Express'i Vercel'de çalıştır (daha hızlı)

**Hangisini tercih edersiniz?**

