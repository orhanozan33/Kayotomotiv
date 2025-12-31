# 🔍 Supabase Tablolar Boş - Çözüm

## ⚠️ Sorun

Supabase Table Editor'de tüm tablolar boş görünüyor. Tablolar oluşturulmuş ama veri yok.

---

## 🔍 Olası Nedenler

1. **SQL Script Çalıştırılmamış**
   - Tablolar oluşturulmamış
   - Seed data eklenmemiş

2. **SQL Script Kısmen Çalıştırılmış**
   - Tablolar oluşturulmuş ama seed data eklenmemiş
   - Sadece schema çalıştırılmış

3. **Seed Data Script'i Çalıştırılmamış**
   - Tablolar var ama veri yok

---

## ✅ Çözüm

### 1️⃣ SQL Script Çalıştır (Eğer Henüz Yapılmadıysa)

1. **SQL Editor:**
   ```
   https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/sql
   ```

2. **"New query" butonuna tıkla**

3. **`SUPABASE_PROJE_rxbtkjihvqjmamdwmsev_KURULUM.sql` dosyasını aç**

4. **Tüm içeriği kopyala (Ctrl+A, Ctrl+C)**

5. **SQL Editor'e yapıştır (Ctrl+V)**

6. **"Run" butonuna tıkla (veya Ctrl+Enter)**

7. **✅ "Success" mesajını bekle**

---

### 2️⃣ Admin User Kontrol

SQL script çalıştırıldıktan sonra:

1. **Table Editor:**
   ```
   https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/editor
   ```

2. **`users` tablosunu aç**

3. **Admin user var mı kontrol et:**
   - Email: `admin@kayoto.com`
   - Role: `admin`

**Eğer yoksa:**
- SQL script çalıştırılmamış demektir
- Yukarıdaki adımları tekrar yapın

---

### 3️⃣ Seed Data Ekle (Manuel)

Eğer tablolar var ama veri yoksa, seed data ekleyin:

1. **SQL Editor:**
   ```
   https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/sql
   ```

2. **Aşağıdaki SQL'i çalıştır:**

```sql
-- Admin user ekle
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES (
    'admin@kayoto.com',
    '$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m', -- Password: admin123
    'Admin',
    'User',
    'admin',
    true
)
ON CONFLICT (email) DO NOTHING;

-- Örnek araç ekle (test için)
INSERT INTO vehicles (brand, model, year, price, mileage, fuel_type, transmission, color, description, status)
VALUES (
    'Toyota',
    'Corolla',
    2023,
    250000.00,
    15000,
    'Benzin',
    'Otomatik',
    'Beyaz',
    'Temiz, bakımlı araç',
    'available'
)
ON CONFLICT DO NOTHING;
```

3. **"Run" butonuna tıkla**

---

## 📋 Kontrol Listesi

- [ ] SQL script çalıştırıldı mı?
- [ ] `users` tablosunda admin user var mı?
- [ ] `vehicles` tablosunda veri var mı?
- [ ] Diğer tablolar oluşturuldu mu?

---

## 🔍 Tabloları Kontrol Et

**Table Editor'de kontrol edin:**

1. **`users` tablosu:**
   - Admin user var mı? (`admin@kayoto.com`)

2. **`vehicles` tablosu:**
   - Araçlar var mı?

3. **Diğer tablolar:**
   - `reservations`
   - `repair_services`
   - `car_wash_packages`
   - vb.

---

## ⚠️ Önemli Not

**SQL script çalıştırıldıktan sonra:**
- Tüm tablolar oluşturulacak
- RLS kapatılacak
- Admin user eklenecek
- Indexes oluşturulacak

**Ama seed data (örnek veriler) sadece admin user için ekleniyor.**

**Örnek araçlar eklemek için:**
- Backoffice'den ekleyebilirsiniz
- Veya SQL Editor'den manuel ekleyebilirsiniz

---

**SQL script'i çalıştırdıktan sonra tabloları kontrol edin!** 🔍

