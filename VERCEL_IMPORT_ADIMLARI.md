# Vercel'de Yeni Proje Oluşturma - Adım Adım

## 🚀 Hızlı Başlangıç

### 1. Vercel Dashboard'a Git
https://vercel.com/new

### 2. GitHub Repo'yu Seç
- **Repository**: `orhanozan33/Kayotomotiv`
- **Import** butonuna tıkla

### 3. Proje Ayarları

**Framework Preset:** `Other`

**Root Directory:** `.` (boş bırak)

**Build Command:**
```
npm run build:all
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install
```

### 4. Environment Variables Ekle

**Settings > Environment Variables** bölümüne git ve şunları ekle:

```
DB_HOST=db.xlioxvlohlgpswhpjawa.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=orhanozan33
JWT_SECRET=ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b
BACKEND_PASSWORD_HASH=$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m
FRONTEND_URL=https://kayoto.vercel.app,https://kayoto.vercel.app/admin
```

**Her birini şu environment'lara ekle:**
- ✅ Production
- ✅ Preview
- ✅ Development

### 5. Deploy Et

**Deploy** butonuna tıkla!

---

## 📋 Kontrol Listesi

- [ ] GitHub repo bağlandı
- [ ] Build command: `npm run build:all`
- [ ] Output directory: `dist`
- [ ] Environment variables eklendi (8 adet)
- [ ] Deployment başladı

---

## 🔗 Linkler

- **Vercel Import:** https://vercel.com/new?import=github&repo=orhanozan33/Kayotomotiv
- **GitHub Repo:** https://github.com/orhanozan33/Kayotomotiv

---

## ⚠️ Önemli Notlar

1. **Proje Adı:** `kayoto` (küçük harf)
2. **Build Command:** `npm run build:all` (mutlaka bu olmalı)
3. **Output Directory:** `dist` (mutlaka bu olmalı)
4. **Environment Variables:** Tüm 8 değişkeni ekle

---

## ✅ Deployment Sonrası

Deployment tamamlandıktan sonra:

1. **Backend API:** `https://kayoto.vercel.app/api`
2. **Admin Panel:** `https://kayoto.vercel.app/admin`
3. **Frontend:** `https://kayoto.vercel.app`

---

**Sorun olursa Vercel Dashboard > Deployments > Logs'a bakın!**
