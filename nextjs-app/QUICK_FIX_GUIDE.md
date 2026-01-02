# 🚀 Hızlı Çözüm Rehberi - İlan Kartları ve Sosyal Medya İkonları

## ❌ Sorunlar

1. **İlan kartları gelmiyor** - API 500 hatası
2. **Sosyal medya ikonları yok** - API 500 hatası

---

## 🔍 ADIM 1: Vercel Functions Logs Kontrolü (ÖNCE BUNU YAP)

### 1.1 Vercel Dashboard'a Git

1. **https://vercel.com** → Projeni seç
2. **Functions** → **Logs** sekmesine git

### 1.2 Hata Mesajlarını Ara

Log'larda şunları ara:
- `✅ Database connected successfully` → Database çalışıyor ✅
- `❌ Database initialization error:` → Database çalışmıyor ❌
- `ENOTFOUND` → Connection string yanlış ❌

### 1.3 Sonuç

**Eğer `✅ Database connected successfully` görüyorsan:**
→ Database çalışıyor, sorun veri eksikliği → **ADIM 2**'ye geç

**Eğer `❌ Database initialization error` görüyorsan:**
→ Database çalışmıyor → **ADIM 3**'e geç

---

## 🔍 ADIM 2: Veritabanında Veri Kontrolü

### 2.1 Supabase Dashboard'a Git

1. **https://supabase.com/dashboard** → Projeni seç
2. **SQL Editor** → **New query**

### 2.2 Vehicles Kontrolü

Şu SQL'i çalıştır:
```sql
SELECT COUNT(*) FROM vehicles;
```

**Sonuç:**
- `0` → Veritabanında araç yok ❌ → **ADIM 4**'e geç
- `10` veya daha fazla → Veritabanında araç var ✅

### 2.3 Settings Kontrolü

Şu SQL'i çalıştır:
```sql
SELECT key, value FROM settings WHERE key IN ('facebook_url', 'instagram_url', 'x_url', 'phone_number');
```

**Sonuç:**
- Boş → Settings tablosunda veri yok ❌ → **ADIM 4**'e geç
- Dolu → Settings var ✅

---

## ✅ ADIM 3: Database Bağlantısını Düzelt

### 3.1 Vercel Dashboard'a Git

1. **Settings** → **Environment Variables**

### 3.2 DATABASE_URL'i Kontrol Et

**DATABASE_URL** variable'ının şu formatta olduğundan emin ol:
```
postgresql://postgres.qttwfdsyafvifngtsxjc:orhanozan33@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

**Kontrol Listesi:**
- [ ] `postgres.qttwfdsyafvifngtsxjc` (project reference doğru mu?)
- [ ] `orhanozan33` (password doğru mu?)
- [ ] `pooler.supabase.com` (pooler kullanılıyor mu?)
- [ ] `6543` (port doğru mu?)
- [ ] `pgbouncer=true` (var mı?)
- [ ] `sslmode=require` (var mı?)

### 3.3 Düzelt ve Redeploy

1. Eğer yanlışsa, düzelt
2. **Save** butonuna tıkla
3. **Deployments** → Son deployment → **...** → **Redeploy**

---

## ✅ ADIM 4: Veritabanına Veri Ekle (Seed Script)

### 4.1 Local'de Seed Script Çalıştır

1. Terminal aç
2. Şu komutları çalıştır:
   ```bash
   cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir\nextjs-app"
   npm run seed
   ```

### 4.2 Seed Script Sonucu

**Başarılı:**
```
✅ Database seeding completed successfully!
✅ Seeded vehicles
✅ Seeded settings
```

**Hata:**
```
❌ Error seeding database: ...
```
→ Hata mesajını not al

### 4.3 Supabase'de Tekrar Kontrol Et

1. Supabase SQL Editor'de:
   ```sql
   SELECT COUNT(*) FROM vehicles;
   SELECT COUNT(*) FROM settings;
   ```
2. Sonuç:
   - `vehicles`: 10 veya daha fazla olmalı
   - `settings`: 14 veya daha fazla olmalı

---

## 🔍 ADIM 5: API Endpoint'lerini Test Et

### 5.1 Vehicles API Test

Tarayıcıda şu URL'yi aç:
```
https://kayotomotiv.vercel.app/api/vehicles
```

**Beklenen:**
```json
{
  "vehicles": [
    {
      "id": "...",
      "brand": "Toyota",
      "model": "Corolla",
      ...
    }
  ]
}
```

**Hata:**
```json
{
  "error": "Database connection failed"
}
```
→ Database bağlantısı çalışmıyor → **ADIM 3**'e dön

### 5.2 Social Media API Test

Tarayıcıda şu URL'yi aç:
```
https://kayotomotiv.vercel.app/api/settings/social-media
```

**Beklenen:**
```json
{
  "links": {
    "facebook": "https://www.facebook.com/kayototamir",
    "instagram": "https://www.instagram.com/kayototamir",
    "x": "https://twitter.com/kayototamir",
    "phone": "+90 555 123 4567"
  }
}
```

**Hata:**
```json
{
  "error": "Database connection failed"
}
```
→ Database bağlantısı çalışmıyor → **ADIM 3**'e dön

---

## 🚨 SORUN GİDERME

### Sorun 1: Database Bağlantısı Çalışmıyor

**Çözüm:**
1. Vercel Functions Logs'da tam hata mesajını kontrol et
2. DATABASE_URL'in doğru olduğundan emin ol
3. Supabase projenin aktif olduğundan emin ol
4. Redeploy yap

### Sorun 2: Veritabanında Veri Yok

**Çözüm:**
1. Local'de seed script çalıştır
2. Supabase'de veri olduğunu kontrol et
3. Vercel'de sayfayı yenile

### Sorun 3: API Endpoint'leri 500 Hatası Veriyor

**Çözüm:**
1. Vercel Functions Logs'da hata mesajını kontrol et
2. Genellikle database bağlantı sorunu olur
3. DATABASE_URL'i kontrol et

---

## ✅ BAŞARI KONTROLÜ

Tüm adımlar tamamlandıysa:
- [ ] Vercel Functions Logs'da `✅ Database connected successfully` görünüyor
- [ ] `/api/vehicles` endpoint'i çalışıyor (500 hatası yok)
- [ ] `/api/settings/social-media` endpoint'i çalışıyor (500 hatası yok)
- [ ] Supabase'de `vehicles` tablosunda 10+ araç var
- [ ] Supabase'de `settings` tablosunda 14+ ayar var
- [ ] Frontend'de araçlar görünüyor
- [ ] Frontend'de sosyal medya ikonları görünüyor

---

## 📞 YARDIM

Hangi adımda sorun var? Şunları paylaş:
1. Vercel Functions Logs'dan hata mesajı
2. `/api/vehicles` endpoint'inin response'u
3. `/api/settings/social-media` endpoint'inin response'u
4. Supabase'de `SELECT COUNT(*) FROM vehicles;` sonucu
5. Seed script çalıştırdığında hata var mı?

