# Vercel Monorepo Kurulum Rehberi

## 🎯 Amaç

Vercel'de 3 ayrı proje (frontend, backend, backoffice) yerine **tek bir proje** (kayoto) içinde hepsini yönetmek.

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

## 📋 ADIM 2: Yeni Tek Proje Oluştur

### Yöntem 1: Vercel CLI ile

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

### Yöntem 2: Vercel Dashboard'dan

1. **Vercel Dashboard:**
   ```
   https://vercel.com/new
   ```

2. **Import Git Repository:**
   - Repository'yi seçin
   - Project Name: `kayoto`
   - Root Directory: `.` (root)
   - Framework Preset: `Other`
   - Build Command: `npm run build:all`
   - Output Directory: `.`
   - Install Command: `npm run install:all`

---

## 📋 ADIM 3: Environment Variables Ekle

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

3. **Her değişken için:** Production, Preview, Development seçin

---

## 📋 ADIM 4: Vercel.json Yapılandırması

Root'ta `vercel.json` dosyası oluşturuldu. Bu dosya:
- `/api/*` → Backend'e yönlendirir
- `/admin/*` → Backoffice'e yönlendirir
- `/*` → Frontend'e yönlendirir

---

## 📋 ADIM 5: API URL'lerini Güncelle

### Frontend API URL

`frontend/src/services/api.js`:
```javascript
API_BASE_URL = 'https://kayoto.vercel.app/api'
```

### Backoffice API URL

`backoffice/src/services/api.js`:
```javascript
API_BASE_URL = 'https://kayoto.vercel.app/api'
```

---

## 📋 ADIM 6: Backend API Endpoint'i Güncelle

`backend/api/index.js` dosyasının doğru çalıştığından emin olun.

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
- ✅ Root'ta `vercel.json` oluşturuldu
- ✅ Root'ta `package.json` oluşturuldu (build script'leri ile)
- ✅ Monorepo yapılandırması hazır

**Yapılacaklar:**
- ⏳ Mevcut Vercel projelerini silin
- ⏳ Yeni "kayoto" projesi oluşturun
- ⏳ Environment variables ekleyin
- ⏳ API URL'lerini güncelleyin
- ⏳ Deploy edin

---

**Hazır olduğunuzda ADIM 1'den başlayın!** 🚀

