# 🔌 Database Bağlantı Hatası Çözümü

## ❌ Hata Mesajı

```
{"error":"Database connection failed","message":"Unable to connect to database. Please check environment variables.","details":"DB_HOST: db.rxbtkjihvqjmamdwmsev.supabase.co"}
```

---

## 🔍 Sorun Analizi

**DB_HOST doğru görünüyor ama bağlantı başarısız.**

**Olası Nedenler:**
1. ❌ DB_PORT yanlış (6543 vs 5432)
2. ❌ SSL ayarları eksik/yanlış
3. ❌ DB_PASSWORD yanlış
4. ❌ Connection string formatı yanlış
5. ❌ Supabase Session Pooler ayarları

---

## ✅ Çözüm Adımları

### ADIM 1: Vercel Environment Variables Kontrol

**Vercel Dashboard:**
```
https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
```

**Kontrol Edin:**
- ✅ DB_HOST: `db.rxbtkjihvqjmamdwmsev.supabase.co`
- ✅ DB_PORT: `6543` (Session Pooler) veya `5432` (Direct)
- ✅ DB_NAME: `postgres`
- ✅ DB_USER: `postgres`
- ✅ DB_PASSWORD: `orhanozan33`

**ÖNEMLİ:** Tüm environment variables'ların **Production, Preview, Development** için ayarlı olduğundan emin olun!

---

### ADIM 2: Supabase Connection Settings Kontrol

**Supabase Dashboard:**
```
https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/settings/database
```

**Kontrol Edin:**
1. **Connection String** formatı
2. **Session Pooler** aktif mi?
3. **Port** bilgisi (6543 veya 5432)
4. **SSL** gereksinimleri

---

### ADIM 3: Port Değiştirme (6543 → 5432)

**Eğer Session Pooler çalışmıyorsa:**

1. **Vercel Dashboard'a git:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
   ```

2. **DB_PORT değişkenini bul**

3. **Değeri değiştir:**
   - Eski: `6543` (Session Pooler)
   - Yeni: `5432` (Direct Connection)

4. **Kaydet**

5. **Redeploy yap:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv
   ```

---

### ADIM 4: SSL Ayarları Kontrol

**Backend'de SSL ayarları:**
```javascript
ssl: process.env.NODE_ENV === 'production' ? {
  rejectUnauthorized: false
} : false
```

**Kontrol:**
- ✅ Production'da SSL aktif olmalı
- ✅ `rejectUnauthorized: false` olmalı (Supabase için)

---

### ADIM 5: Connection String Test

**Supabase Dashboard'dan Connection String al:**

1. **Database Settings'e git:**
   ```
   https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/settings/database
   ```

2. **Connection String'i kopyala:**
   - Format: `postgresql://postgres:[PASSWORD]@db.rxbtkjihvqjmamdwmsev.supabase.co:6543/postgres`

3. **Bilgileri karşılaştır:**
   - Host: `db.rxbtkjihvqjmamdwmsev.supabase.co` ✅
   - Port: `6543` veya `5432` ✅
   - Database: `postgres` ✅
   - User: `postgres` ✅
   - Password: `orhanozan33` ✅

---

## 🔧 Hızlı Çözüm

### Senaryo 1: Session Pooler (Port 6543)

**Vercel Environment Variables:**
```
DB_HOST=db.rxbtkjihvqjmamdwmsev.supabase.co
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=orhanozan33
```

**Backend SSL:**
```javascript
ssl: {
  rejectUnauthorized: false
}
```

---

### Senaryo 2: Direct Connection (Port 5432)

**Vercel Environment Variables:**
```
DB_HOST=db.rxbtkjihvqjmamdwmsev.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=orhanozan33
```

**Backend SSL:**
```javascript
ssl: {
  rejectUnauthorized: false
}
```

---

## 🧪 Test

**1. Health Endpoint:**
```
https://kayotomotiv.vercel.app/api/health
```
**Beklenen:** `200 OK`

**2. Settings Endpoint:**
```
https://kayotomotiv.vercel.app/api/settings/social-media
```
**Beklenen:** `200 OK`

**3. Vehicles Endpoint:**
```
https://kayotomotiv.vercel.app/api/vehicles
```
**Beklenen:** `200 OK` (tablolar oluşturulduktan sonra)

---

## 📋 Kontrol Listesi

- [ ] Vercel environment variables doğru mu?
- [ ] DB_PORT doğru mu? (6543 veya 5432)
- [ ] DB_PASSWORD doğru mu?
- [ ] SSL ayarları aktif mi?
- [ ] Supabase Session Pooler aktif mi?
- [ ] Backend redeploy edildi mi?
- [ ] Vercel logs kontrol edildi mi?

---

## 🚨 Hala Çalışmıyorsa

**1. Vercel Logs Kontrol:**
```
https://vercel.com/orhanozan33/kayotomotiv
```

**2. Supabase Logs Kontrol:**
```
https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/logs
```

**3. Connection String Test:**
- Supabase Dashboard'dan connection string'i kopyala
- Local'de test et (pgAdmin veya psql)

---

## ✅ Özet

**Sorun:** Database connection failed
**Çözüm:** 
1. Environment variables kontrol
2. Port değiştir (6543 ↔ 5432)
3. SSL ayarları kontrol
4. Redeploy

**En Hızlı Çözüm:** Port'u `5432` yap ve redeploy et!

