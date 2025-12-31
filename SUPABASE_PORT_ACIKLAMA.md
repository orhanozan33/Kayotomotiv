# 🔌 Supabase Port Açıklaması

## ⚠️ Önemli: Port 5432 vs 6543

### 🔍 Durum

Supabase Dashboard'da connection string'de **port 5432** gösteriliyor olabilir. Bu normaldir ve sorun değildir.

---

## 📋 Port Kullanımı

### 1️⃣ Direct Connection
- **Port:** `5432`
- **Host:** `db.rxbtkjihvqjmamdwmsev.supabase.co`
- **IPv4:** ❌ Uyumlu değil

### 2️⃣ Session Pooler (SHARED)
- **Port:** `6543` (Vercel'de kullanılacak)
- **Host:** `db.rxbtkjihvqjmamdwmsev.supabase.co`
- **IPv4:** ✅ Uyumlu

**NOT:** Supabase Dashboard'da connection string'de port 5432 gösterilebilir, ama Session Pooler için Vercel'de **6543** kullanılmalı!

---

## ✅ Vercel Ayarları

Vercel'de **DB_PORT=6543** olarak ayarlanmış durumda. Bu doğru!

**Kontrol:**
```
https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
```

**DB_PORT değeri:**
- ✅ `6543` (Session Pooler - IPv4 için)

---

## 🔧 Backend Kod Kontrolü

Backend kodunda `DB_PORT` environment variable'ı kullanılıyor:

```javascript
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,  // Vercel'de 6543 olarak ayarlı
  database: process.env.DB_NAME || 'ototamir',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
});
```

**Vercel'de:**
- `DB_PORT=6543` ✅
- Backend bu port'u kullanacak ✅

---

## 🎯 Sonuç

1. ✅ **Supabase Dashboard'da port 5432 gösterilse bile sorun değil**
2. ✅ **Vercel'de DB_PORT=6543 olarak ayarlı (doğru)**
3. ✅ **Backend kodunda DB_PORT environment variable kullanılıyor**
4. ✅ **Session Pooler için 6543 portu kullanılacak**

---

## ⚠️ Önemli Not

**Supabase connection string'de port değiştiremezsiniz** - bu normaldir. Önemli olan:

- ✅ **Vercel'de DB_PORT=6543** (Session Pooler için)
- ✅ **Backend kodunda `process.env.DB_PORT` kullanılıyor**
- ✅ **Session Pooler seçili** (IPv4 için)

---

## 🧪 Test

Deployment sonrası Vercel logs'unda kontrol edin:

```
✅ Database connected successfully
```

Eğer connection başarılıysa, port doğru çalışıyor demektir!

---

**Port 5432 gösterilse bile, Vercel'de 6543 kullanılıyor ve bu doğru!** ✅

