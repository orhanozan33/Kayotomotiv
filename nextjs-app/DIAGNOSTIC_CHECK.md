# 🔍 Sorun Tespiti ve Çözüm Rehberi

## ❌ Sorunlar

1. **İlan kartları gelmiyor** - API 500 hatası
2. **Sosyal medya ikonları yok** - API 500 hatası

---

## 🔍 ADIM 1: Vercel Functions Logs Kontrolü

### 1.1 Vercel Dashboard'a Git

1. **https://vercel.com** → Projeni seç
2. **Functions** → **Logs** sekmesine git

### 1.2 Hata Mesajlarını Ara

Log'larda şunları ara:
- `❌ Database initialization error:`
- `❌ Database connection error`
- `ENOTFOUND`
- `getaddrinfo ENOTFOUND`

### 1.3 Tam Hata Mesajını Kopyala

Eğer hata görüyorsan, tam hata mesajını not al.

---

## 🔍 ADIM 2: API Endpoint'lerini Test Et

### 2.1 Vehicles API Test

Tarayıcıda şu URL'yi aç:
```
https://kayotomotiv.vercel.app/api/vehicles
```

**Beklenen:**
```json
{
  "vehicles": [...]
}
```

**Hata:**
```json
{
  "error": "..."
}
```

### 2.2 Social Media API Test

Tarayıcıda şu URL'yi aç:
```
https://kayotomotiv.vercel.app/api/settings/social-media
```

**Beklenen:**
```json
{
  "links": {
    "facebook": "...",
    "instagram": "...",
    "x": "...",
    "phone": "..."
  }
}
```

**Hata:**
```json
{
  "error": "..."
}
```

---

## 🔍 ADIM 3: Veritabanında Veri Kontrolü

### 3.1 Supabase Dashboard'a Git

1. **https://supabase.com/dashboard** → Projeni seç
2. **SQL Editor** → **New query**

### 3.2 Vehicles Kontrolü

Şu SQL'i çalıştır:
```sql
SELECT COUNT(*) FROM vehicles;
```

**Sonuç:**
- `0` → Veritabanında araç yok, seed script çalıştır
- `10` veya daha fazla → Veritabanında araç var ✅

### 3.3 Settings Kontrolü

Şu SQL'i çalıştır:
```sql
SELECT key, value FROM settings WHERE key IN ('facebook_url', 'instagram_url', 'x_url', 'phone_number');
```

**Sonuç:**
- Boş → Settings tablosunda veri yok, seed script çalıştır
- Dolu → Settings var ✅

---

## ✅ ÇÖZÜM ADIMLARI

### Çözüm 1: Database Bağlantısı Hala Çalışmıyor

**Sorun:** `ENOTFOUND` veya `Database connection failed`

**Çözüm:**
1. Vercel Dashboard → **Settings** → **Environment Variables**
2. **DATABASE_URL** variable'ını kontrol et:
   ```
   postgresql://postgres.qttwfdsyafvifngtsxjc:orhanozan33@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
   ```
3. Doğru olduğundan emin ol
4. **Redeploy** yap

### Çözüm 2: Veritabanında Veri Yok

**Sorun:** API çalışıyor ama boş array dönüyor

**Çözüm:**
1. Local'de seed script çalıştır:
   ```bash
   cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir\nextjs-app"
   npm run seed
   ```
2. Seed script başarılı olursa, Vercel'de sayfayı yenile

### Çözüm 3: Settings Tablosunda Veri Yok

**Sorun:** Sosyal medya ikonları görünmüyor

**Çözüm:**
1. Seed script çalıştır (yukarıdaki gibi)
2. Settings tablosuna veri eklenir
3. Vercel'de sayfayı yenile

---

## 🚨 HIZLI KONTROL LİSTESİ

- [ ] Vercel Functions Logs'da `✅ Database connected successfully` görünüyor mu?
- [ ] `/api/vehicles` endpoint'i çalışıyor mu? (500 hatası yok mu?)
- [ ] `/api/settings/social-media` endpoint'i çalışıyor mu? (500 hatası yok mu?)
- [ ] Supabase'de `vehicles` tablosunda veri var mı?
- [ ] Supabase'de `settings` tablosunda veri var mı?
- [ ] Vercel'de DATABASE_URL doğru mu?

---

## 📞 YARDIM

Hangi adımda sorun var? Şunları paylaş:
1. Vercel Functions Logs'dan hata mesajı
2. `/api/vehicles` endpoint'inin response'u
3. `/api/settings/social-media` endpoint'inin response'u
4. Supabase'de `SELECT COUNT(*) FROM vehicles;` sonucu

