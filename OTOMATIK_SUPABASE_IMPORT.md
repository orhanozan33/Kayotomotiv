# 🚀 Otomatik Supabase Import Rehberi

## ⚠️ Önemli Not

**Supabase Management API SQL execution desteklemiyor.** Bu yüzden SQL script'lerini manuel olarak Supabase SQL Editor'de çalıştırmanız gerekiyor.

---

## ✅ Bağlantı Testi Sonucu

**Supabase Bağlantısı:** ✅ EKLİ VE ÇALIŞIYOR

**Proje ID:** `rxbtkjihvqjmamdwmsev`

---

## 📋 SQL Script'leri Çalıştırma

### ADIM 1: İlk Script (Schema ve RLS)

1. **SQL Editor'e git:**
   ```
   https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/sql
   ```

2. **"New query" butonuna tıkla**

3. **`SUPABASE_PROJE_rxbtkjihvqjmamdwmsev_KURULUM.sql` dosyasını aç**

4. **Tüm içeriği kopyala (Ctrl+A, Ctrl+C)**

5. **SQL Editor'e yapıştır (Ctrl+V)**

6. **"Run" butonuna tıkla (veya Ctrl+Enter)**

7. **✅ "Success" mesajını bekle**

**Bu script:**
- ✅ Tüm tabloları oluşturur
- ✅ RLS'yi kapatır
- ✅ Admin user ekler
- ✅ Indexes oluşturur

---

### ADIM 2: İkinci Script (Seed Data)

1. **SQL Editor'de "New query" butonuna tıkla**

2. **`SUPABASE_SEED_DATA_EKLE.sql` dosyasını aç**

3. **Tüm içeriği kopyala (Ctrl+A, Ctrl+C)**

4. **SQL Editor'e yapıştır (Ctrl+V)**

5. **"Run" butonuna tıkla (veya Ctrl+Enter)**

6. **✅ "Success" mesajını bekle**

**Bu script:**
- ✅ 5 örnek araç ekler
- ✅ 8 tamir servisi ekler
- ✅ 4 yıkama paketi ekler
- ✅ 4 ekstra hizmet ekler
- ✅ 3 sayfa ekler

---

## 🔍 Kontrol

**Table Editor:**
```
https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/editor
```

**Kontrol edin:**
- ✅ `users` tablosu var mı? (Admin user: `admin@kayoto.com`)
- ✅ `vehicles` tablosu var mı? (5 araç var mı?)
- ✅ `repair_services` tablosu var mı? (8 servis var mı?)
- ✅ `car_wash_packages` tablosu var mı? (4 paket var mı?)

---

## 🧪 Test

**Frontend:**
```
https://kayotomotiv.vercel.app/
```

**API Endpoints:**
```
https://kayotomotiv.vercel.app/api/vehicles
https://kayotomotiv.vercel.app/api/health
```

**Admin Giriş:**
```
https://kayotomotiv.vercel.app/admin/login
Email: admin@kayoto.com
Password: admin123
```

---

## 📋 Özet

**Bağlantı Durumu:**
- ✅ Supabase'e bağlanıyor
- ✅ Environment variables ayarlı
- ✅ Connection string doğru

**Yapılacaklar:**
- ⏳ SQL script'lerini çalıştır (manuel)
- ⏳ Tabloları kontrol et
- ⏳ Frontend'i test et

---

**SQL script'lerini çalıştırdıktan sonra frontend'i test edin!** 🚀

