# ⚡ Hızlı Seed Data Ekleme

## 🎯 Sorun

- ✅ Admin user var
- ❌ Araç ilanları yok
- ❌ Rezervasyonlar açılmıyor

---

## ✅ Çözüm: Seed Data Ekle

### 1️⃣ SQL Editor'e Git

**Direkt link:**
```
https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/sql
```

---

### 2️⃣ Seed Data Script'i Çalıştır

1. **"New query" butonuna tıkla**

2. **`SUPABASE_SEED_DATA_EKLE.sql` dosyasını aç**

3. **Tüm içeriği kopyala (Ctrl+A, Ctrl+C)**

4. **SQL Editor'e yapıştır (Ctrl+V)**

5. **"Run" butonuna tıkla (veya Ctrl+Enter)**

6. **✅ "Success" mesajını bekle**

---

### 3️⃣ Kontrol Et

**Table Editor'de kontrol edin:**

1. **`vehicles` tablosu:**
   - 5 örnek araç eklenecek
   - Toyota Corolla, Honda Civic, vb.

2. **`repair_services` tablosu:**
   - 8 tamir servisi eklenecek

3. **`car_wash_packages` tablosu:**
   - 4 yıkama paketi eklenecek

---

### 4️⃣ Frontend'de Test Et

1. **Frontend sayfası:**
   ```
   https://kayotomotiv.vercel.app/
   ```

2. **"Oto Galeri" veya "Araçlar" sayfasına git**

3. **Araçlar görünmeli:**
   - 5 örnek araç listelenmeli
   - Araç detayları açılabilmeli

---

## 📋 Eklenen Veriler

**Araçlar (5 adet):**
- Toyota Corolla 2023
- Honda Civic 2022
- Ford Focus 2021
- Volkswagen Golf 2023
- Renault Clio 2022

**Tamir Servisleri (8 adet):**
- Yağ Değişimi
- Fren Servisi
- Hava Filtresi Değişimi
- Akü Değişimi
- Lastik Rotasyonu
- Şanzıman Servisi
- Soğutma Sistemi Temizliği
- Timing Kayışı Değişimi

**Yıkama Paketleri (4 adet):**
- Temel Yıkama
- Standart Yıkama
- Premium Yıkama
- Deluxe Yıkama

---

## ⚠️ Önemli Not

**Seed data script'i çalıştırdıktan sonra:**
- Araçlar frontend'de görünecek
- Rezervasyon yapılabilir
- Tamir servisleri görünecek
- Yıkama paketleri görünecek

---

**Seed data script'ini çalıştırdıktan sonra frontend'i test edin!** 🚀

