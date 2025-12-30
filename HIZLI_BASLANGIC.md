# 🚀 HIZLI BAŞLANGIÇ - TEMİZLEME VE YENİDEN KURULUM

## ⚡ Hızlı Yol (Otomatik)

### 1. Temizleme ve Kurulum Script'ini Çalıştır

```powershell
cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"
powershell -ExecutionPolicy Bypass -File "TEMIZLEME_VE_YENIDEN_KURULUM.ps1"
```

Bu script:
- ✅ Vercel projelerini siler
- ✅ Supabase temizleme SQL'ini gösterir
- ✅ Yeniden kurulum rehberini açar

---

## 📋 Adım Adım (Manuel)

### ADIM 1: Vercel Projelerini Sil

**Yöntem 1: Script ile**
```powershell
powershell -ExecutionPolicy Bypass -File "vercel-projeleri-sil.ps1"
```

**Yöntem 2: Dashboard'dan**
1. https://vercel.com/orhanozan33-1123s-projects
2. Her projeyi sil: Backend, Frontend, Backoffice

---

### ADIM 2: Supabase Tablolarını Temizle

1. **Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/xlioxvlohlgpswhpjawa/sql/new
   ```

2. **SUPABASE_TEMIZLEME.sql** dosyasını açın ve içeriğini kopyalayın

3. **SQL Editor'e yapıştırın ve "Run" butonuna tıklayın**

---

### ADIM 3: Yeni Projeleri Deploy Et

**Yöntem 1: Otomatik Script**
```powershell
powershell -ExecutionPolicy Bypass -File "OTOMATIK_YENIDEN_KURULUM.ps1"
```

**Yöntem 2: Manuel (Vercel CLI)**
```powershell
# Backend
cd backend
vercel --prod --token vck_30SelLzv3008tnFQOvl1PUxTqyqo3JPu4dtmBHAlz112qZpvKj0soi37

# Frontend
cd ..\frontend
vercel --prod --token vck_30SelLzv3008tnFQOvl1PUxTqyqo3JPu4dtmBHAlz112qZpvKj0soi37

# Backoffice
cd ..\backoffice
vercel --prod --token vck_30SelLzv3008tnFQOvl1PUxTqyqo3JPu4dtmBHAlz112qZpvKj0soi37
```

---

### ADIM 4: Environment Variables Ekle

1. **Backend Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33-1123s-projects/backend/settings/environment-variables
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
   FRONTEND_URL=https://frontend-xxx.vercel.app,https://backoffice-xxx.vercel.app
   ```
   **NOT:** FRONTEND_URL'yi frontend ve backoffice deploy edildikten sonra güncelleyin!

3. **Her değişken için:** Production, Preview, Development seçin

---

### ADIM 5: Supabase Migration'ları

1. **Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/xlioxvlohlgpswhpjawa/sql/new
   ```

2. **001_initial_schema.sql çalıştır:**
   - `backend/migrations/001_initial_schema.sql` dosyasını açın
   - İçeriğini kopyalayın
   - SQL Editor'e yapıştırın
   - "Run" butonuna tıklayın

3. **002_seed_data.sql çalıştır:**
   - `backend/migrations/002_seed_data.sql` dosyasını açın
   - İçeriğini kopyalayın
   - SQL Editor'e yapıştırın
   - "Run" butonuna tıklayın

---

### ADIM 6: RLS Kapat

1. **Supabase SQL Editor:**
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

2. **"Run" butonuna tıklayın**

---

### ADIM 7: Test

1. **Backend Health:**
   ```
   https://backend-xxx.vercel.app/api/health
   ```

2. **Backoffice Login:**
   ```
   https://backoffice-xxx.vercel.app/login
   Email: admin@gmail.com
   Password: 33333333
   ```

3. **Frontend:**
   ```
   https://frontend-xxx.vercel.app
   ```

---

## ✅ Özet

1. ✅ Vercel projelerini sil
2. ✅ Supabase tablolarını temizle
3. ✅ Yeni projeleri deploy et
4. ✅ Environment variables ekle
5. ✅ Migration'ları çalıştır
6. ✅ RLS'i kapat
7. ✅ Test et

---

**Hazır olduğunuzda başlayın!** 🚀
