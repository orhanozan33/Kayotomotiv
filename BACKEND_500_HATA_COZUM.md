# Backend 500 Hatası - Çözüm Rehberi

## 🔍 Sorun

Admin giriş yapınca `/api/auth/login` endpoint'i **500 Internal Server Error** veriyor.

## 🔍 Olası Nedenler

1. **Database Connection Hatası**
   - Supabase bağlantısı başarısız
   - Environment variables eksik/yanlış

2. **JWT_SECRET Eksik**
   - Token oluşturulamıyor

3. **Users Tablosu Yok**
   - Migration'lar çalıştırılmamış

4. **Import/Module Hatası**
   - Serverless function'da module bulunamıyor

---

## ✅ Yapılan Düzeltmeler

### 1. Detaylı Logging Eklendi

`api/index.js` dosyasına detaylı loglar eklendi:
- Request method ve URL
- Environment variables durumu
- Error stack traces

### 2. Error Handling İyileştirildi

Backend'de hata mesajları daha detaylı gösteriliyor.

---

## 🔧 Kontrol Adımları

### 1. Vercel Logs Kontrol Et

1. **Vercel Dashboard'a git:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv
   ```

2. **Son deployment'ı seç**

3. **Logs sekmesine git**

4. **Runtime logs'u kontrol et:**
   - `/api/auth/login` isteği yapıldığında
   - Hata mesajlarını oku

### 2. Environment Variables Kontrol Et

Vercel Dashboard > Settings > Environment Variables:

```
DB_HOST=db.xlioxvlohlgpswhpjawa.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=orhanozan33
JWT_SECRET=ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b
```

**Her birini şu environment'lara ekle:**
- ✅ Production
- ✅ Preview
- ✅ Development

### 3. Supabase Migration Kontrol Et

1. **Supabase Dashboard'a git:**
   ```
   https://supabase.com/dashboard/project/xlioxvlohlgpswhpjawa
   ```

2. **SQL Editor'e git**

3. **Users tablosunu kontrol et:**
   ```sql
   SELECT * FROM users LIMIT 1;
   ```

4. **Eğer tablo yoksa migration çalıştır:**
   - `backend/migrations/001_initial_schema.sql`
   - `backend/migrations/002_seed_data.sql`

---

## 🧪 Test

Deployment tamamlandıktan sonra:

1. **Admin giriş sayfasına git:**
   ```
   https://kayotomotiv.vercel.app/admin/login
   ```

2. **Giriş yapmayı dene**

3. **Browser console'u aç (F12)**

4. **Hata mesajını kontrol et**

5. **Vercel logs'u kontrol et:**
   - Detaylı loglar görünecek
   - Hata nedeni anlaşılacak

---

## 📋 Yaygın Hatalar ve Çözümleri

### Hata: "Database connection failed"

**Çözüm:**
- Environment variables'ları kontrol et
- Supabase connection string'i doğru mu?
- SSL ayarları doğru mu?

### Hata: "Users table does not exist"

**Çözüm:**
- Supabase'de migration'ları çalıştır
- `001_initial_schema.sql` dosyasını çalıştır

### Hata: "JWT_SECRET missing"

**Çözüm:**
- Vercel'de `JWT_SECRET` environment variable'ını ekle

---

## 🚀 Sonraki Adımlar

1. ✅ Deployment tamamlandı
2. ⏳ Vercel logs'u kontrol et
3. ⏳ Hata mesajını oku
4. ⏳ Gerekirse environment variables'ları düzelt
5. ⏳ Migration'ları çalıştır

---

**Logs'taki hata mesajını paylaş, birlikte çözelim!** 🔍

