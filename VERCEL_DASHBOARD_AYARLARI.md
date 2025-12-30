# Vercel Dashboard Ayarları - Kayoto Projesi

## 🔧 Yapılması Gerekenler

### ADIM 1: Build Ayarlarını Güncelleyin

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayoto/settings
   ```

2. **General Settings → Build & Development Settings:**

   - **Build Command:** `npm run build:all`
   - **Output Directory:** `.` (sadece nokta)
   - **Install Command:** `npm install` (veya boş bırakın)
   - **Node.js Version:** `18.x` (veya boş bırakın)

3. **Save** butonuna tıklayın

---

### ADIM 2: Environment Variables Kontrolü

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayoto/settings/environment-variables
   ```

2. **Şu 8 değişkenin olduğundan emin olun:**

   - ✅ DB_HOST = `db.xlioxvlohlgpswhpjawa.supabase.co`
   - ✅ DB_PORT = `5432`
   - ✅ DB_NAME = `postgres`
   - ✅ DB_USER = `postgres`
   - ✅ DB_PASSWORD = `orhanozan33`
   - ✅ JWT_SECRET = `ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b`
   - ✅ BACKEND_PASSWORD_HASH = `$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m`
   - ✅ FRONTEND_URL = `https://kayoto.vercel.app`

3. **Her değişken için:** Production, Preview, Development seçili olmalı

---

### ADIM 3: Redeploy

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayoto/deployments
   ```

2. **En son deployment → "..." → Redeploy**

   veya

3. **Git'e yeni bir commit push edin:**
   ```powershell
   git commit --allow-empty -m "Trigger deployment"
   git push
   ```

---

## 🧪 Test

Deployment tamamlandıktan sonra:

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
3. ✅ Environment Variables: 8 adet
4. ✅ Redeploy

---

**Vercel Dashboard'da ayarları güncelleyip redeploy edin!** 🚀

