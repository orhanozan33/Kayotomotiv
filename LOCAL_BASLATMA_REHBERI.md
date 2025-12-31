# 🚀 Local Proje Başlatma Rehberi

## 📋 Gereksinimler

- Node.js 24.x
- npm veya yarn
- PostgreSQL (Supabase kullanılıyor, local gerekmez)

---

## 🔧 ADIM 1: .env Dosyası Oluştur

**Proje root'unda `.env` dosyası oluşturun:**

```env
# Local Development Environment Variables
# Supabase Database Connection

DB_HOST=db.rxbtkjihvqjmamdwmsev.supabase.co
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=orhanozan33

# JWT Secret
JWT_SECRET=ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b

# Backend Password Hash
BACKEND_PASSWORD_HASH=$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m

# Frontend URLs
FRONTEND_URL=http://localhost:3000,http://localhost:3002

# Node Environment
NODE_ENV=development
```

**Dosya Konumu:**
```
C:\Users\orhan\OneDrive\Masaüstü\oto tamir\.env
```

---

## 📦 ADIM 2: Dependencies Yükle

**Tüm projeler için dependencies yükleyin:**

```powershell
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..

# Backoffice
cd backoffice
npm install
cd ..
```

**VEYA otomatik script:**
```powershell
npm run install:all
```

---

## 🚀 ADIM 3: Projeleri Başlat

### Yöntem 1: Otomatik Script (Önerilen)

**Tüm projeleri otomatik başlat:**
```powershell
powershell -ExecutionPolicy Bypass -File "local-baslat-tum.ps1"
```

Bu script:
- ✅ Tüm dependencies'leri kontrol eder
- ✅ 3 ayrı terminal penceresi açar
- ✅ Her projeyi ayrı terminalde başlatır

---

### Yöntem 2: Manuel Başlatma

**3 ayrı terminal penceresi açın:**

#### Terminal 1 - Backend:
```powershell
cd backend
npm run dev
```
**Backend:** http://localhost:3001

#### Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```
**Frontend:** http://localhost:3000

#### Terminal 3 - Backoffice:
```powershell
cd backoffice
npm run dev
```
**Backoffice:** http://localhost:3002

---

## ✅ Kontrol

**1. Backend Health Check:**
```
http://localhost:3001/api/health
```
**Beklenen:** `{"status":"ok","timestamp":"..."}`

**2. Frontend:**
```
http://localhost:3000
```
**Beklenen:** Frontend sayfası açılır

**3. Backoffice:**
```
http://localhost:3002
```
**Beklenen:** Admin login sayfası açılır

---

## 🔍 Sorun Giderme

### Port Zaten Kullanılıyor

**Hata:** `Error: listen EADDRINUSE: address already in use :::3001`

**Çözüm:**
```powershell
# Port'u kullanan process'i bul
netstat -ano | findstr :3001

# Process'i sonlandır (PID'yi değiştirin)
taskkill /PID <PID> /F
```

---

### Database Bağlantı Hatası

**Hata:** `getaddrinfo ENOTFOUND db.rxbtkjihvqjmamdwmsev.supabase.co`

**Çözüm:**
1. `.env` dosyasını kontrol edin
2. `DB_HOST` doğru mu?
3. Internet bağlantınızı kontrol edin

---

### Dependencies Eksik

**Hata:** `Cannot find module '...'`

**Çözüm:**
```powershell
# İlgili projeye gidin
cd backend  # veya frontend, backoffice

# Dependencies yükleyin
npm install
```

---

## 📋 Özet

**Başlatma Sırası:**
1. ✅ `.env` dosyası oluştur
2. ✅ Dependencies yükle (`npm install`)
3. ✅ Backend başlat (`npm run dev`)
4. ✅ Frontend başlat (`npm run dev`)
5. ✅ Backoffice başlat (`npm run dev`)

**URL'ler:**
- Backend: http://localhost:3001
- Frontend: http://localhost:3000
- Backoffice: http://localhost:3002

---

**Projeleri başlattıktan sonra tarayıcıda test edin!** 🚀

