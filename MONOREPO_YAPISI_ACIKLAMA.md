# 🏗️ Monorepo Yapısı Açıklaması

## 📋 Durum

### ❌ Eski Yapı (3 Ayrı Proje)

Daha önce Vercel'de **3 ayrı proje** vardı:
1. **frontend** - Frontend uygulaması
2. **backend** - Backend API
3. **backoffice** - Admin paneli

Her biri ayrı Vercel projesi olarak deploy ediliyordu.

---

### ✅ Yeni Yapı (Tek Monorepo Proje)

Şimdi **tek bir proje** var: **`kayotomotiv`**

Bu proje içinde **3 uygulama** birlikte deploy ediliyor:
1. **Frontend** → Ana sayfa (`/`)
2. **Backend** → API endpoint'leri (`/api/*`)
3. **Backoffice** → Admin paneli (`/admin/*`)

---

## 🎯 Nasıl Çalışıyor?

### 1️⃣ Tek Proje, 3 Uygulama

**Vercel Projesi:** `kayotomotiv`

**İçindeki uygulamalar:**
- ✅ Frontend → `https://kayotomotiv.vercel.app/`
- ✅ Backend → `https://kayotomotiv.vercel.app/api/*`
- ✅ Backoffice → `https://kayotomotiv.vercel.app/admin/*`

---

### 2️⃣ Routing Yapısı

`vercel.json` dosyasında routing kuralları var:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"  // Backend API
    },
    {
      "source": "/admin/(.*)",
      "destination": "/admin/index.html"  // Backoffice
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"  // Frontend
    }
  ]
}
```

**Nasıl çalışır:**
- `/api/*` → Backend serverless function
- `/admin/*` → Backoffice (React app)
- `/` → Frontend (React app)

---

### 3️⃣ Build Yapısı

`package.json` dosyasında build script'i:

```json
{
  "scripts": {
    "build:all": "npm run clean-dist && npm run install:all && npm run build:frontend && npm run build:backoffice && npm run copy-api && npm run verify-dist"
  }
}
```

**Build sırası:**
1. ✅ `dist` klasörü temizlenir
2. ✅ Tüm bağımlılıklar yüklenir
3. ✅ Frontend build edilir → `dist/`
4. ✅ Backoffice build edilir → `dist/admin/`
5. ✅ Backend API kopyalanır → `api/index.js`

---

## 📁 Proje Yapısı

```
kayotomotiv/
├── frontend/          # Frontend uygulaması
│   ├── src/
│   └── package.json
├── backoffice/        # Admin paneli
│   ├── src/
│   └── package.json
├── backend/           # Backend API
│   ├── src/
│   └── package.json
├── api/               # Vercel serverless function
│   └── index.js
├── dist/               # Build çıktısı
│   ├── index.html      # Frontend
│   └── admin/          # Backoffice
│       └── index.html
├── vercel.json         # Vercel routing
└── package.json        # Monorepo root
```

---

## 🔍 Vercel Dashboard'da Ne Görüyorsunuz?

### Tek Proje: `kayotomotiv`

**Deployments:**
- Her commit'te tek bir deployment
- Tüm uygulamalar birlikte build edilir

**Environment Variables:**
- Tüm uygulamalar aynı environment variables'ları kullanır
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`

**Logs:**
- Frontend, Backend ve Backoffice logları birlikte görünür
- `/api/*` istekleri → Backend logs
- `/admin/*` istekleri → Backoffice logs
- `/` istekleri → Frontend logs

---

## ✅ Avantajlar

1. ✅ **Tek deployment** - Daha hızlı ve kolay
2. ✅ **Tek environment variables** - Yönetim kolaylığı
3. ✅ **Tek domain** - CORS sorunları yok
4. ✅ **Tek proje** - Daha az karmaşıklık

---

## 🔗 URL'ler

**Production:**
- Frontend: `https://kayotomotiv.vercel.app/`
- Backend: `https://kayotomotiv.vercel.app/api/*`
- Backoffice: `https://kayotomotiv.vercel.app/admin/*`

**Custom Domain (eğer varsa):**
- Frontend: `https://kayauto.com/`
- Backend: `https://kayauto.com/api/*`
- Backoffice: `https://kayauto.com/admin/*`

---

## 🧪 Test

### Frontend Test:
```
https://kayotomotiv.vercel.app/
```

### Backend Test:
```
https://kayotomotiv.vercel.app/api/health
```

### Backoffice Test:
```
https://kayotomotiv.vercel.app/admin/login
```

---

## 📋 Özet

- ❌ **Eski:** 3 ayrı Vercel projesi
- ✅ **Yeni:** Tek monorepo proje (`kayotomotiv`)
- ✅ **Frontend:** `/`
- ✅ **Backend:** `/api/*`
- ✅ **Backoffice:** `/admin/*`

**Hepsi tek projede, tek deployment'da!** 🚀

