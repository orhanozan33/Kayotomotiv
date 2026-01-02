# 🔍 Internal Server Error - Debug Rehberi

## ❌ Sorun

API endpoint'leri hala `{"error":"Internal server error"}` döndürüyor.

## 🔍 Debug Adımları

### ADIM 1: Vercel Functions Logs Kontrolü

1. **Vercel Dashboard** → **Functions** → **Logs** sekmesine git
2. En son log'ları görüntüle
3. Şu mesajları ara:
   - `🚀 GET /api/vehicles - Starting...`
   - `🔍 Environment check:`
   - `✅ Database initialized`
   - `❌ GET /api/vehicles - Error:`
   - `❌ Database initialization error:`

4. **Son 50-100 satırı kopyala** ve paylaş

### ADIM 2: API Endpoint Test (Yeni Deploy Sonrası)

Deploy tamamlandıktan sonra (2-3 dakika):

1. Tarayıcıda şu URL'yi aç:
   ```
   https://kayotomotiv.vercel.app/api/vehicles
   ```

2. **Response'u kontrol et:**
   - Artık sadece `{"error":"Internal server error"}` değil
   - Daha detaylı hata mesajı görmeli:
     ```json
     {
       "error": "...",
       "code": "...",
       "name": "...",
       "details": "..."
     }
     ```

### ADIM 3: Environment Variables Kontrolü

1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Şu değişkenlerin olduğundan emin ol:
   - ✅ `DATABASE_URL` - Supabase connection string
   - ✅ `JWT_SECRET` - JWT secret key
   - ✅ `BACKEND_PASSWORD_HASH` - Backend password hash
   - ✅ `NODE_ENV` - `production` olmalı

3. **DATABASE_URL Formatı:**
   ```
   postgresql://postgres.qttwfdsyafvifngtsxjc:orhanozan33@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
   ```

### ADIM 4: Supabase Database Kontrolü

1. **Supabase Dashboard** → **SQL Editor** → **New query**
2. Şu SQL'i çalıştır:
   ```sql
   SELECT COUNT(*) FROM vehicles;
   SELECT COUNT(*) FROM settings;
   ```
3. Sonuçları not al:
   - `vehicles` tablosunda kaç kayıt var?
   - `settings` tablosunda kaç kayıt var?

## 🎯 Muhtemel Sorunlar ve Çözümler

### Sorun 1: Database Connection Hala Başarısız

**Belirtiler:**
- Vercel Logs'da `❌ Database initialization error:`
- SSL hatası veya connection timeout

**Çözüm:**
1. DATABASE_URL'in doğru olduğundan emin ol
2. Port `6543` olmalı (5432 değil)
3. Host `pooler.supabase.com` olmalı
4. `NODE_TLS_REJECT_UNAUTHORIZED=0` ekle (opsiyonel)

### Sorun 2: Veritabanında Veri Yok

**Belirtiler:**
- Database bağlantısı başarılı
- Ama `vehicles` tablosu boş
- Response: `{"vehicles":[]}` (hata değil, sadece boş)

**Çözüm:**
1. Local'de seed script çalıştır:
   ```bash
   cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir\nextjs-app"
   npm run seed
   ```

### Sorun 3: TypeORM Entity Hatası

**Belirtiler:**
- Vercel Logs'da entity/table bulunamadı hatası
- `relation "vehicles" does not exist`

**Çözüm:**
1. Supabase'de tabloların var olduğundan emin ol
2. `supabase-schema.sql` dosyasını Supabase SQL Editor'de çalıştır

### Sorun 4: JWT_SECRET Eksik

**Belirtiler:**
- Vercel Logs'da `JWT_SECRET` hatası
- Authentication endpoint'leri çalışmıyor

**Çözüm:**
1. Vercel Environment Variables'a `JWT_SECRET` ekle
2. En az 32 karakter uzunluğunda olmalı

## 📊 Paylaşılması Gereken Bilgiler

1. **Vercel Functions Logs** (son 50-100 satır)
2. **API Response** (yeni deploy sonrası, detaylı hata mesajı)
3. **Supabase Database Counts:**
   - `SELECT COUNT(*) FROM vehicles;` sonucu
   - `SELECT COUNT(*) FROM settings;` sonucu
4. **Vercel Environment Variables** (sadece isimler, değerler değil):
   - Hangi environment variable'lar var?
   - `DATABASE_URL` var mı?
   - `JWT_SECRET` var mı?

---

**Not:** Error handler güncellendi, artık production'da da daha fazla detay gösterecek. Yeni deploy sonrası test et ve sonuçları paylaş.

