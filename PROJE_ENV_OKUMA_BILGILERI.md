# 📖 Proje Environment Database Okuma Bilgileri

## 🔍 Proje Hangi Dosyadan Okuyor?

### Backend Kod Analizi

**Dosya:** `backend/src/config/database.js`

```javascript
import dotenv from 'dotenv';

dotenv.config();  // ← Bu satır .env dosyasını okur

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ototamir',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : '333333'),
  // ...
});
```

---

## 📋 Okuma Sırası

### 1. **Local Development (Yerel Geliştirme)**

**Okuduğu Dosya:** `.env` (proje root'unda)

**Konum:**
```
C:\Users\orhan\OneDrive\Masaüstü\oto tamir\.env
```

**Nasıl Çalışır:**
- `dotenv.config()` çalışır
- Proje root'unda `.env` dosyasını arar
- Bulursa içeriğini `process.env`'e yükler

**Örnek `.env` dosyası:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ototamir
DB_USER=postgres
DB_PASSWORD=333333
JWT_SECRET=your-secret-key
```

---

### 2. **Vercel Production (Canlı Ortam)**

**Okuduğu Kaynak:** Vercel Dashboard Environment Variables

**Konum:**
```
https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
```

**Nasıl Çalışır:**
- Vercel otomatik olarak environment variables'ları `process.env`'e yükler
- `dotenv.config()` çalışır ama `.env` dosyası yok (Vercel'de)
- Direkt `process.env.DB_HOST` vs. kullanılır

**Vercel Environment Variables:**
```
DB_HOST=db.rxbtkjihvqjmamdwmsev.supabase.co
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=orhanozan33
JWT_SECRET=ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b
```

---

## 🔄 Okuma Önceliği

1. **Vercel Production:**
   - ✅ Vercel Dashboard Environment Variables
   - ❌ `.env` dosyası (yok)

2. **Local Development:**
   - ✅ `.env` dosyası (varsa)
   - ✅ `process.env` (sistem environment variables)

---

## 📁 Mevcut Environment Dosyaları

### 1. `VERCEL_ENV_DATABASE_BILGILERI.env` ✅ (GÜNCEL)

**İçerik:**
```env
DB_HOST=db.rxbtkjihvqjmamdwmsev.supabase.co
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=orhanozan33
JWT_SECRET=ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b
BACKEND_PASSWORD_HASH=$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m
FRONTEND_URL=https://kayotomotiv.vercel.app,https://kayotomotiv.vercel.app/admin
```

**Durum:** ✅ Güncel Supabase proje ID (`rxbtkjihvqjmamdwmsev`)

---

### 2. `vercel-env-import.env` ❌ (ESKİ)

**İçerik:**
```env
DB_HOST=db.xlioxvlohlgpswhpjawa.supabase.co  ← ESKİ PROJE ID
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=orhanozan33
```

**Durum:** ❌ Eski Supabase proje ID (`xlioxvlohlgpswhpjawa`)

---

### 3. `vercel-env-yeni-supabase.env` ❌ (ESKİ)

**İçerik:**
```env
DB_HOST=db.qttwfdsyafvifngtsxjc.supabase.co  ← ESKİ PROJE ID
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[SUPABASE_PASSWORD_BURAYA]
```

**Durum:** ❌ Eski Supabase proje ID (`qttwfdsyafvifngtsxjc`)

---

## ✅ Şu Anda Kullanılan

### Vercel Production:

**Kaynak:** Vercel Dashboard Environment Variables

**Güncel Değerler:**
- `DB_HOST`: `db.rxbtkjihvqjmamdwmsev.supabase.co` ✅
- `DB_PORT`: `6543` (veya `5432`) ✅
- `DB_NAME`: `postgres` ✅
- `DB_USER`: `postgres` ✅
- `DB_PASSWORD`: `orhanozan33` ✅

**Kontrol:**
```
https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
```

---

### Local Development:

**Kaynak:** `.env` dosyası (eğer varsa)

**Kontrol:**
```
C:\Users\orhan\OneDrive\Masaüstü\oto tamir\.env
```

**Eğer `.env` dosyası yoksa:**
- Default değerler kullanılır:
  - `DB_HOST`: `localhost`
  - `DB_PORT`: `5432`
  - `DB_NAME`: `ototamir`
  - `DB_USER`: `postgres`
  - `DB_PASSWORD`: `333333`

---

## 🔧 Yapılacaklar

### 1. Vercel Environment Variables Kontrol

**Vercel Dashboard:**
```
https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
```

**Kontrol Edin:**
- ✅ `DB_HOST` = `db.rxbtkjihvqjmamdwmsev.supabase.co`
- ✅ `DB_PORT` = `6543` (veya `5432`)
- ✅ `DB_NAME` = `postgres`
- ✅ `DB_USER` = `postgres`
- ✅ `DB_PASSWORD` = `orhanozan33`

---

### 2. Local Development İçin `.env` Dosyası Oluştur

**Dosya:** `.env` (proje root'unda)

**İçerik:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ototamir
DB_USER=postgres
DB_PASSWORD=333333
JWT_SECRET=ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b
BACKEND_PASSWORD_HASH=$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m
FRONTEND_URL=http://localhost:3000,http://localhost:3002
NODE_ENV=development
```

**NOT:** `.env` dosyası `.gitignore`'da olmalı (güvenlik için)

---

## 📋 Özet

**Vercel Production:**
- ✅ Vercel Dashboard Environment Variables'dan okuyor
- ✅ Güncel Supabase proje ID: `rxbtkjihvqjmamdwmsev`

**Local Development:**
- ✅ `.env` dosyasından okuyor (varsa)
- ✅ Yoksa default değerler kullanılıyor

**Referans Dosya:**
- ✅ `VERCEL_ENV_DATABASE_BILGILERI.env` (güncel değerler)

---

**Proje şu anda Vercel Dashboard'daki environment variables'dan okuyor!** ✅

