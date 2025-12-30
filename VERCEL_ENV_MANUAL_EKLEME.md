# Vercel Environment Variables - Manuel Ekleme Rehberi

## 📋 Vercel Dashboard'dan Ekleme

### ADIM 1: Environment Variables Sayfasına Gidin

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33-1123s-projects/kayoto/settings/environment-variables
   ```

2. **VEYA** Import sayfasında "Çevresel Değişkenler" bölümünü açın

---

### ADIM 2: Her Değişkeni Ekleyin

**"Add New"** butonuna tıklayıp her değişkeni tek tek ekleyin:

---

#### 1. DB_HOST
- **Key:** `DB_HOST`
- **Value:** `db.xlioxvlohlgpswhpjawa.supabase.co`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development (hepsini seçin)
- **Save**

---

#### 2. DB_PORT
- **Key:** `DB_PORT`
- **Value:** `5432`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Save**

---

#### 3. DB_NAME
- **Key:** `DB_NAME`
- **Value:** `postgres`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Save**

---

#### 4. DB_USER
- **Key:** `DB_USER`
- **Value:** `postgres`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Save**

---

#### 5. DB_PASSWORD
- **Key:** `DB_PASSWORD`
- **Value:** `orhanozan33`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Save**

---

#### 6. JWT_SECRET
- **Key:** `JWT_SECRET`
- **Value:** `ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Save**

---

#### 7. BACKEND_PASSWORD_HASH
- **Key:** `BACKEND_PASSWORD_HASH`
- **Value:** `$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Save**

---

#### 8. FRONTEND_URL
- **Key:** `FRONTEND_URL`
- **Value:** `https://kayoto.vercel.app`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Save**

---

## ⚡ Hızlı Kopyala-Yapıştır

**vercel-env-import.env** dosyasını açın ve değerleri kopyalayın:

```
DB_HOST=db.xlioxvlohlgpswhpjawa.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=orhanozan33
JWT_SECRET=ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b
BACKEND_PASSWORD_HASH=$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m
FRONTEND_URL=https://kayoto.vercel.app
```

---

## ✅ Özet

1. ✅ Environment Variables bölümünü açın
2. ✅ Her değişkeni tek tek ekleyin (8 adet)
3. ✅ Her değişken için Production, Preview, Development seçin
4. ✅ Deploy butonuna tıklayın

---

**Tüm değişkenleri ekledikten sonra Deploy butonuna tıklayın!** 🚀

