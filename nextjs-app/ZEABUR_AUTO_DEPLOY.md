# Zeabur Otomatik Deployment ve Servis Senkronizasyonu

## 🎯 Hedef: GitHub Push → Otomatik Deploy → Sistem Yayına Başlar

GitHub'a push ettiğinizde, Zeabur otomatik olarak deploy eder ve frontend, backend ve database senkronize çalışır.

---

## 📋 ZEABUR DASHBOARD KURULUMU (Sadece İlk Kez)

### 1️⃣ GitHub Entegrasyonu (Otomatik Deploy için)

1. **Zeabur Dashboard** > Projeniz > **Settings** > **Git**
2. GitHub repository'nizi bağlayın (eğer bağlı değilse)
3. **Auto Deploy** aktif olmalı ✅
4. **Branch**: `main` (veya kullandığınız branch)
5. Her push'ta otomatik deploy edilecek

### 2️⃣ Database Servisi Oluşturma

**Eğer database henüz yoksa:**

1. Zeabur Dashboard > Projeniz > **Add Service**
2. **Database** > **PostgreSQL** seçin
3. Database adını girin (örn: `postgresql` veya `database`)
4. **Deploy** edin
5. Database oluşturulduktan sonra:
   - **Connection String** otomatik olarak environment variable olarak eklenir
   - Veya manuel olarak alabilirsiniz

**Mevcut Database için:**
- Connection String'i kopyalayın
- Next.js servisine `DATABASE_URL` olarak ekleyin

### 3️⃣ Next.js Servisi Ayarları

1. **Root Directory**: `nextjs-app` (Settings > General)
2. **Environment Variables** ekleyin (Settings > Environment Variables):

```bash
# Database (Eğer database servisi aynı projedeyse, otomatik eklenebilir)
DATABASE_URL=postgresql://root:b51YkdQPD4UnW83R96fc2BOm7zSTqsj0@sjc1.clusters.zeabur.com:29595/zeabur?sslmode=require

# JWT Secret
JWT_SECRET=your-super-s3cr3t-jwt-key-ch@nge-this-in-production-min-32-chars

# Backend Admin Password Hash
BACKEND_PASSWORD_HASH=$2a$10$dS3A5VdyubEHGSnI5ITF2OL/CHYP4qDFna6.RMOv9SuWg4/9tJifa

# Node Environment
NODE_ENV=production

# Database SSL
DB_SSL=true

# Frontend URL (İlk deployment sonrası güncelleyin)
FRONTEND_URL=https://[your-zeabur-url].zeabur.app
```

### 4️⃣ İlk Deployment

1. **Deploy** butonuna tıklayın (veya GitHub'a push edin)
2. Build loglarını takip edin
3. Deployment tamamlandıktan sonra:
   - Zeabur URL'ini kopyalayın
   - `FRONTEND_URL` environment variable'ını güncelleyin
   - Deployment otomatik yeniden başlayacak

---

## 🔄 OTOMATIK ÇALIŞMA SÜRECİ

### GitHub Push → Zeabur Otomatik Deploy

1. ✅ **GitHub'a push edersiniz**
2. ✅ **Zeabur otomatik olarak algılar** (Auto Deploy aktifse)
3. ✅ **Build başlar** (`npm install` → `npm run build`)
4. ✅ **Application başlar** (`npm start`)
5. ✅ **Database bağlantısı kurulur** (DATABASE_URL ile)
6. ✅ **TypeORM tabloları oluşturur** (`synchronize: true`)
7. ✅ **Seed data çalışır** (ilk deployment'da)
8. ✅ **Sistem yayına başlar** 🚀

### Servisler Arası Bağlantı

- **Database Servisi** → **Next.js Servisi**
  - Connection String: `DATABASE_URL` environment variable
  - SSL: Otomatik aktif (production mode)
  - TypeORM: Otomatik tablo oluşturma

- **Frontend** → **Backend (API Routes)**
  - Next.js API Routes: `/app/api/*`
  - Otomatik olarak aynı serviste çalışır
  - Database: Aynı connection string kullanır

---

## ⚙️ OTOMATIK ÇALIŞMA ÖZELLİKLERİ

### TypeORM Otomatik Tablo Oluşturma

```typescript
// lib/config/typeorm.ts
synchronize: true  // Tablolar otomatik oluşturulur/güncellenir
```

- ✅ İlk deployment'da tüm tablolar otomatik oluşturulur
- ✅ Entity değişikliklerinde tablolar otomatik güncellenir
- ✅ Seed data otomatik çalışır

### Database Connection

```typescript
// lib/config/database.ts
// Production mode'da SSL otomatik aktif
// Connection pool otomatik yönetilir
```

---

## 🔍 KONTROL LİSTESİ

### ✅ Otomatik Deploy için:

- [ ] GitHub repository Zeabur'a bağlı
- [ ] Auto Deploy aktif
- [ ] Branch doğru ayarlanmış (main)

### ✅ Database için:

- [ ] Database servisi oluşturuldu
- [ ] DATABASE_URL environment variable eklendi
- [ ] SSL aktif (production mode'da otomatik)

### ✅ Next.js Servisi için:

- [ ] Root Directory: `nextjs-app`
- [ ] Tüm environment variables eklendi
- [ ] FRONTEND_URL güncellendi (deployment sonrası)

### ✅ Deployment Sonrası:

- [ ] Build başarılı
- [ ] Application çalışıyor
- [ ] Database bağlantısı başarılı
- [ ] Tablolar oluşturuldu
- [ ] Seed data çalıştı
- [ ] Frontend erişilebilir
- [ ] API endpoints çalışıyor

---

## 🚀 SONUÇ

GitHub'a push ettiğinizde:

1. ✅ Zeabur otomatik deploy eder
2. ✅ Frontend, backend ve database senkronize çalışır
3. ✅ Tablolar otomatik oluşturulur
4. ✅ Seed data otomatik çalışır
5. ✅ Sistem yayına başlar

**Artık sadece `git push` yapmanız yeterli!** 🎉

