# 🚨 500 Internal Server Error - Çözüm Adımları

## ⚠️ Hata

```
500: INTERNAL_SERVER_ERROR
Code: FUNCTION_INVOCATION_FAILED
```

Backend serverless function çöküyor.

---

## 🔍 Olası Nedenler

1. **Database Connection Hatası**
   - Supabase bağlantısı başarısız
   - Environment variables eksik/yanlış
   - DB_PASSWORD eksik

2. **Users Tablosu Yok**
   - SQL script çalıştırılmamış
   - Migration'lar yapılmamış

3. **Environment Variables Eksik**
   - DB_PASSWORD eksik
   - DB_HOST yanlış
   - JWT_SECRET eksik

---

## ✅ Çözüm Adımları

### 1️⃣ Vercel Logs Kontrol

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv
   ```

2. **Son deployment'ı seç**

3. **"Logs" sekmesine git**

4. **Runtime logs'u kontrol et:**
   - `/api/health` isteği yapıldığında
   - Hata mesajını oku
   - Database connection hatası var mı?

---

### 2️⃣ Environment Variables Kontrol

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
   ```

2. **Şu variables'ları kontrol et:**

   ✅ **DB_HOST:**
   ```
   db.rxbtkjihvqjmamdwmsev.supabase.co
   ```

   ✅ **DB_PORT:**
   ```
   6543
   ```

   ✅ **DB_NAME:**
   ```
   postgres
   ```

   ✅ **DB_USER:**
   ```
   postgres
   ```

   ⚠️ **DB_PASSWORD:**
   ```
   orhanozan33
   ```
   **Eğer yoksa ekle!**

   ✅ **JWT_SECRET:**
   ```
   ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b
   ```

3. **Her variable için:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

---

### 3️⃣ Supabase SQL Script Çalıştır

1. **SQL Editor:**
   ```
   https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/sql
   ```

2. **"New query" butonuna tıkla**

3. **`SUPABASE_PROJE_rxbtkjihvqjmamdwmsev_KURULUM.sql` dosyasını aç**

4. **Tüm içeriği kopyala (Ctrl+A, Ctrl+C)**

5. **SQL Editor'e yapıştır (Ctrl+V)**

6. **"Run" butonuna tıkla (veya Ctrl+Enter)**

7. **✅ "Success" mesajını bekle**

---

### 4️⃣ Deployment Yeniden Başlat

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv
   ```

2. **Son deployment'ı seç**

3. **"Redeploy" butonuna tıklayın**

4. **2-3 dakika bekleyin**

---

### 5️⃣ Test Et

1. **Health endpoint:**
   ```
   https://kayotomotiv.vercel.app/api/health
   ```

2. **Admin giriş:**
   ```
   https://kayotomotiv.vercel.app/admin/login
   Email: admin@kayoto.com
   Password: admin123
   ```

---

## 📋 Kontrol Listesi

- [ ] Vercel logs kontrol edildi
- [ ] Environment variables kontrol edildi
- [ ] DB_PASSWORD eklendi mi?
- [ ] DB_PORT=6543 mi?
- [ ] Supabase SQL script çalıştırıldı mı?
- [ ] Users tablosu var mı? (Supabase Table Editor'de kontrol et)
- [ ] Deployment yeniden başlatıldı mı?
- [ ] Test edildi mi?

---

## 🔍 Hata Mesajları

### Database Connection Failed
```
❌ Database connection failed: getaddrinfo ENOTFOUND
```
**Çözüm:** DB_HOST yanlış veya Supabase projesi yanlış

### Users Table Does Not Exist
```
❌ relation "users" does not exist
```
**Çözüm:** SQL script çalıştırılmamış

### JWT_SECRET Missing
```
❌ JWT_SECRET environment variable gerekli
```
**Çözüm:** JWT_SECRET ekle

---

**Vercel logs'undaki hata mesajını paylaşın, birlikte çözelim!** 🔍

