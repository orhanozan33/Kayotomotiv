# 🔄 YENİDEN KURULUM REHBERİ

## ⚠️ DİKKAT

Bu rehber **TÜM** mevcut verileri ve projeleri siler ve sıfırdan kurulum yapar.

---

## 📋 ADIM 1: Vercel Projelerini Sil

### Yöntem 1: PowerShell Script ile (Otomatik)

1. PowerShell'i yönetici olarak açın
2. Script'i çalıştırın:
   ```powershell
   cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"
   powershell -ExecutionPolicy Bypass -File "vercel-projeleri-sil.ps1"
   ```
3. Onay verin (E tuşuna basın)

### Yöntem 2: Vercel Dashboard'dan (Manuel)

1. Vercel Dashboard'a gidin:
   ```
   https://vercel.com/orhanozan33-1123s-projects
   ```

2. Her projeyi tek tek silin:
   - Backend → Settings → Delete Project
   - Frontend → Settings → Delete Project
   - Backoffice → Settings → Delete Project

---

## 📋 ADIM 2: Supabase Tablolarını Temizle

1. **Supabase Dashboard'a gidin:**
   ```
   https://supabase.com/dashboard/project/xlioxvlohlgpswhpjawa
   ```

2. **SQL Editor'ü açın:**
   - Sol menüden "SQL Editor" seçin

3. **Temizleme script'ini çalıştırın:**
   - `SUPABASE_TEMIZLEME.sql` dosyasının içeriğini kopyalayın
   - SQL Editor'e yapıştırın
   - "Run" butonuna tıklayın

4. **Onay mesajını kontrol edin:**
   ```
   Tüm tablolar, sequence'ler, function'lar ve view'lar temizlendi!
   ```

---

## 📋 ADIM 3: Yeni Vercel Projeleri Oluştur

### Backend

1. **Vercel Dashboard:**
   ```
   https://vercel.com/new
   ```

2. **Proje ayarları:**
   - Import Git Repository: **Hayır** (manuel upload)
   - Framework Preset: **Other**
   - Root Directory: `backend`
   - Build Command: `npm install` (veya boş bırakın)
   - Output Directory: `.` (veya boş bırakın)
   - Install Command: `npm install`

3. **Environment Variables ekleyin:**
   ```
   DB_HOST=db.xlioxvlohlgpswhpjawa.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=orhanozan33
   JWT_SECRET=ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b
   BACKEND_PASSWORD_HASH=$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m
   FRONTEND_URL=https://frontend-xxx.vercel.app,https://backoffice-xxx.vercel.app
   ```
   **NOT:** FRONTEND_URL'yi frontend ve backoffice deploy edildikten sonra güncelleyin!

4. **Deploy edin**

### Frontend

1. **Vercel Dashboard:**
   ```
   https://vercel.com/new
   ```

2. **Proje ayarları:**
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy edin**

4. **URL'yi not edin** (backend environment variables için gerekli)

### Backoffice

1. **Vercel Dashboard:**
   ```
   https://vercel.com/new
   ```

2. **Proje ayarları:**
   - Framework Preset: **Vite**
   - Root Directory: `backoffice`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy edin**

4. **URL'yi not edin** (backend environment variables için gerekli)

---

## 📋 ADIM 4: Backend Environment Variables Güncelle

1. **Backend projesine gidin:**
   ```
   https://vercel.com/orhanozan33-1123s-projects/backend/settings/environment-variables
   ```

2. **FRONTEND_URL'yi güncelleyin:**
   - Frontend ve Backoffice URL'lerini ekleyin
   - Format: `https://frontend-xxx.vercel.app,https://backoffice-xxx.vercel.app`

3. **Backend'i redeploy edin**

---

## 📋 ADIM 5: Supabase Migration'ları Çalıştır

1. **Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/xlioxvlohlgpswhpjawa/sql/new
   ```

2. **Migration'ları sırayla çalıştırın:**

   a. **001_initial_schema.sql:**
      - `backend/migrations/001_initial_schema.sql` dosyasını açın
      - İçeriğini kopyalayın
      - SQL Editor'e yapıştırın
      - "Run" butonuna tıklayın

   b. **002_seed_data.sql:**
      - `backend/migrations/002_seed_data.sql` dosyasını açın
      - İçeriğini kopyalayın
      - SQL Editor'e yapıştırın
      - "Run" butonuna tıklayın

3. **Admin kullanıcıyı kontrol edin:**
   ```sql
   SELECT * FROM users WHERE email = 'admin@gmail.com';
   ```

---

## 📋 ADIM 6: RLS (Row Level Security) Kapat

1. **Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/xlioxvlohlgpswhpjawa/sql/new
   ```

2. **RLS'i kapat:**
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
   ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
   ALTER TABLE repair_quotes DISABLE ROW LEVEL SECURITY;
   ALTER TABLE repair_appointments DISABLE ROW LEVEL SECURITY;
   ALTER TABLE car_wash_appointments DISABLE ROW LEVEL SECURITY;
   ALTER TABLE pages DISABLE ROW LEVEL SECURITY;
   ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
   ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
   ```

3. **"Run" butonuna tıklayın**

---

## 📋 ADIM 7: Test

1. **Backend Health Check:**
   ```
   https://backend-xxx.vercel.app/api/health
   ```
   Beklenen: `{"status":"ok"}`

2. **Backoffice Login:**
   ```
   https://backoffice-xxx.vercel.app/login
   ```
   - Email: `admin@gmail.com`
   - Password: `33333333`

3. **Frontend:**
   ```
   https://frontend-xxx.vercel.app
   ```
   - Ana sayfa açılmalı
   - İlan kartları görünmeli

---

## ✅ Özet

1. ✅ Vercel projelerini sil
2. ✅ Supabase tablolarını temizle
3. ✅ Yeni Vercel projeleri oluştur
4. ✅ Environment variables ekle
5. ✅ Migration'ları çalıştır
6. ✅ RLS'i kapat
7. ✅ Test et

---

**Hazır olduğunuzda ADIM 1'den başlayın!** 🚀

