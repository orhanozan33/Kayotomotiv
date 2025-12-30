# 🚀 Kayoto Projesini Ayaklandırma - Adım Adım

## 📋 Vercel Dashboard'da Yapılacaklar

### ADIM 1: Build Ayarlarını Güncelleyin

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayoto/settings
   ```

2. **General Settings → Build & Development Settings:**

   - **Build Command:** `npm run build:all`
   - **Output Directory:** `.` (sadece nokta - root dizin)
   - **Install Command:** `npm install` (veya boş bırakın)
   - **Node.js Version:** `18.x` (veya boş bırakın)

3. **"Save"** butonuna tıklayın

---

### ADIM 2: Environment Variables Ekleyin

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayoto/settings/environment-variables
   ```

2. **"Add New"** butonuna tıklayın ve şu 8 değişkeni ekleyin:

   #### 1. DB_HOST
   - Key: `DB_HOST`
   - Value: `db.xlioxvlohlgpswhpjawa.supabase.co`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - **Save**

   #### 2. DB_PORT
   - Key: `DB_PORT`
   - Value: `5432`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - **Save**

   #### 3. DB_NAME
   - Key: `DB_NAME`
   - Value: `postgres`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - **Save**

   #### 4. DB_USER
   - Key: `DB_USER`
   - Value: `postgres`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - **Save**

   #### 5. DB_PASSWORD
   - Key: `DB_PASSWORD`
   - Value: `orhanozan33`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - **Save**

   #### 6. JWT_SECRET
   - Key: `JWT_SECRET`
   - Value: `ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - **Save**

   #### 7. BACKEND_PASSWORD_HASH
   - Key: `BACKEND_PASSWORD_HASH`
   - Value: `$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - **Save**

   #### 8. FRONTEND_URL
   - Key: `FRONTEND_URL`
   - Value: `https://kayoto.vercel.app`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - **Save**

---

### ADIM 3: Redeploy Edin

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayoto/deployments
   ```

2. **En son deployment'ı bulun**

3. **"..." (üç nokta) → "Redeploy"** tıklayın

   veya

4. **Yeni bir commit push edin:**
   ```powershell
   git commit --allow-empty -m "Trigger deployment"
   git push
   ```

---

## 🧪 Test

Deployment tamamlandıktan sonra (2-3 dakika):

1. **Frontend:**
   ```
   https://kayoto.vercel.app
   ```

2. **Backoffice:**
   ```
   https://kayoto.vercel.app/admin
   ```

3. **Backend API:**
   ```
   https://kayoto.vercel.app/api/health
   ```

---

## ✅ Özet

1. ✅ Build Command: `npm run build:all`
2. ✅ Output Directory: `.`
3. ✅ Environment Variables: 8 adet ekleyin
4. ✅ Redeploy edin

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

**Vercel Dashboard'da ayarları yapıp redeploy edin!** 🚀

