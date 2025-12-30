# 🚀 HIZLI MONOREPO KURULUM

## ✅ Hazır Dosyalar

- ✅ `vercel.json` - Root monorepo yapılandırması
- ✅ `package.json` - Build script'leri
- ✅ API URL'leri güncellendi (otomatik domain kullanımı)

---

## 📋 ADIM 1: Mevcut Projeleri Sil

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33-1123s-projects
   ```

2. **Her projeyi sil:**
   - Backend → Settings → Delete Project
   - Frontend → Settings → Delete Project
   - Backoffice → Settings → Delete Project

---

## 📋 ADIM 2: Yeni Proje Oluştur

### Otomatik (Script ile)

```powershell
cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"
powershell -ExecutionPolicy Bypass -File "kayoto-vercel-kurulum.ps1"
```

### Manuel (Vercel CLI)

```powershell
cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"
vercel --prod --token vck_30SelLzv3008tnFQOvl1PUxTqyqo3JPu4dtmBHAlz112qZpvKj0soi37
```

**Sorular:**
- Project name: `kayoto`
- Directory: `.` (root)
- Framework: `Other`
- Build Command: `npm run build:all`
- Output Directory: `.`

---

## 📋 ADIM 3: Environment Variables

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33-1123s-projects/kayoto/settings/environment-variables
   ```

2. **Şu değişkenleri ekleyin:**
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

## 🧪 Test

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

**Yapılanlar:**
- ✅ Root `vercel.json` oluşturuldu
- ✅ Root `package.json` oluşturuldu
- ✅ API URL'leri güncellendi (otomatik domain)

**Yapılacaklar:**
- ⏳ Mevcut projeleri silin
- ⏳ Yeni "kayoto" projesi oluşturun
- ⏳ Environment variables ekleyin

---

**Hazır olduğunuzda ADIM 1'den başlayın!** 🚀

