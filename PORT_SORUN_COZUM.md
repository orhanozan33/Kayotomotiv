# 🔌 Port Sorunu Çözümü

## ⚠️ Durum

Supabase Dashboard'da connection string'de **port 5432** gösteriliyor ve değiştirilemiyor. Bu **normaldir** ve sorun değildir!

---

## ✅ Çözüm

### 1️⃣ Supabase Dashboard vs Vercel

**Supabase Dashboard:**
- Connection string'de port **5432** gösterilir (değiştirilemez)
- Bu sadece gösterim amaçlıdır

**Vercel Environment Variables:**
- `DB_PORT=6543` ✅ (Session Pooler için)
- Backend bu değeri kullanacak ✅

---

### 2️⃣ Backend Kod Kontrolü

Backend kodunda (`backend/src/config/database.js`):

```javascript
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,  // ← Vercel'de 6543 olarak ayarlı
  database: process.env.DB_NAME || 'ototamir',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
});
```

**Önemli:**
- Backend `process.env.DB_PORT` kullanıyor ✅
- Vercel'de `DB_PORT=6543` ayarlı ✅
- Backend **6543** portunu kullanacak ✅

---

### 3️⃣ Vercel Environment Variables Kontrol

**Vercel Dashboard:**
```
https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
```

**DB_PORT değeri:**
- ✅ `6543` (Session Pooler - IPv4 için)

Eğer `5432` görüyorsanız, güncelleyin:
1. `DB_PORT` variable'ını bulun
2. Value'yu `6543` olarak değiştirin
3. Save butonuna tıklayın

---

## 🎯 Sonuç

1. ✅ **Supabase Dashboard'da port 5432 gösterilse bile sorun değil**
2. ✅ **Vercel'de DB_PORT=6543 olarak ayarlı (doğru)**
3. ✅ **Backend kodunda `process.env.DB_PORT` kullanılıyor**
4. ✅ **Session Pooler için 6543 portu kullanılacak**

---

## 🔧 Vercel'de DB_PORT Kontrol Et

Eğer Vercel'de `DB_PORT` yoksa veya `5432` ise:

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
   ```

2. **DB_PORT variable'ını bulun veya ekleyin:**
   - Key: `DB_PORT`
   - Value: `6543`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

3. **Save butonuna tıklayın**

4. **Deployment'ı yeniden başlatın**

---

## 🧪 Test

Deployment sonrası Vercel logs'unda kontrol edin:

```
✅ Database connected successfully
```

Eğer connection başarılıysa, port doğru çalışıyor demektir!

---

**Özet: Supabase'de port 5432 gösterilse bile, Vercel'de 6543 kullanılıyor ve bu doğru!** ✅

