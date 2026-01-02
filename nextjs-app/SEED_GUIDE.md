# 🌱 Seed Script Kullanım Rehberi

Bu rehber, database'e örnek veri eklemek için seed script'ini nasıl çalıştıracağını gösterir.

## 📋 Seed Script Ne Yapar?

Seed script şunları oluşturur:
- ✅ Admin kullanıcısı (admin@gmail.com / şifre: 33333333)
- ✅ Örnek araçlar (Toyota, BMW, Mercedes vb.)
- ✅ Araç resimleri
- ✅ Tamir servisleri
- ✅ Oto yıkama paketleri
- ✅ Oto yıkama ekstraları
- ✅ Ayarlar (Settings)
- ✅ Sayfalar (Pages)

---

## 🔵 ADIM 1: Environment Variables Hazırla

### 1.1 .env.local Dosyası Oluştur

`nextjs-app` klasöründe `.env.local` dosyası oluştur:

```env
# Supabase Database
DATABASE_URL=postgresql://postgres:orhanozan33@db.daruylcofjhrvjhilsuf.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1

# JWT Secret
JWT_SECRET=omibIG1Z2H3RnMWq7aZQrjz5i3OQWKww6E5cnMEqL1k=

# Backend Password Hash
BACKEND_PASSWORD_HASH=$2b$10$K6Ry0L33ZDOude/nR0haeukjokNzFim/nB.KJrzop7tF1mojN0fRu

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

**ÖNEMLİ:** `.env.local` dosyası `.gitignore`'da olduğu için GitHub'a commit edilmez.

---

## 🔵 ADIM 2: Dependencies Kontrol Et

### 2.1 Node Modules Yüklü mü?

Terminal'de `nextjs-app` klasörüne git ve kontrol et:

```bash
cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir\nextjs-app"
```

Eğer `node_modules` klasörü yoksa:

```bash
npm install
```

---

## 🔵 ADIM 3: Seed Script'i Çalıştır

### 3.1 Terminal'de Komutu Çalıştır

`nextjs-app` klasöründeyken:

```bash
npm run seed
```

### 3.2 Ne Olacak?

Script şunları yapacak:
1. Database bağlantısını kontrol edecek
2. Tabloların var olduğunu kontrol edecek
3. Örnek verileri ekleyecek:
   - Admin kullanıcısı
   - Örnek araçlar
   - Servisler
   - Paketler
   - vb.

### 3.3 Başarı Mesajı

Eğer başarılı olursa şu mesajları göreceksin:

```
🔄 Initializing database connection...
✅ Database connected
🌱 Starting database seeding...
✅ Created admin user (admin@gmail.com / 33333333)
✅ Created 10 vehicles
✅ Created vehicle images
✅ Created repair services
✅ Created car wash packages
✅ Created car wash addons
✅ Created settings
✅ Created pages
✅ Seed script completed
```

---

## 🔵 ADIM 4: Sonuçları Kontrol Et

### 4.1 Supabase'de Kontrol Et

1. Supabase Dashboard'a git: https://daruylcofjhrvjhilsuf.supabase.co
2. **Table Editor**'e git
3. Tabloları kontrol et:
   - `users` → Admin kullanıcısı olmalı
   - `vehicles` → Örnek araçlar olmalı
   - `repair_services` → Servisler olmalı
   - vb.

### 4.2 Admin Panel'de Test Et

1. Local development server'ı başlat:
   ```bash
   npm run dev
   ```

2. Tarayıcıda aç: http://localhost:3000/admin-panel/login
3. Giriş yap:
   - **Email:** admin@gmail.com
   - **Şifre:** 33333333

---

## ⚠️ Önemli Notlar

### Seed Script Tekrar Çalıştırılabilir mi?

- ✅ **Evet**, güvenle tekrar çalıştırabilirsin
- Script mevcut verileri kontrol eder
- Sadece yeni veriler ekler (duplicate kontrolü yapar)

### Production'da Seed Script Çalıştırılmalı mı?

- ❌ **Hayır**, production'da seed script çalıştırma
- Production'da veriler zaten var olmalı
- Seed script sadece development/test için

### Seed Script Hata Verirse?

1. Database bağlantısını kontrol et (`.env.local` dosyası)
2. Tabloların oluşturulduğundan emin ol (Supabase'de)
3. Hata mesajını oku ve düzelt

---

## 🔧 Sorun Giderme

### Hata: "Cannot find module '@/scripts/seed-data'"

**Çözüm:**
- `nextjs-app` klasöründe olduğundan emin ol
- `npm install` çalıştır

### Hata: "Database connection failed"

**Çözüm:**
- `.env.local` dosyasının doğru olduğundan emin ol
- `DATABASE_URL`'in doğru olduğundan emin ol
- Supabase projenin aktif olduğundan emin ol

### Hata: "Table does not exist"

**Çözüm:**
- Supabase'de tabloların oluşturulduğundan emin ol
- `supabase-schema.sql` dosyasını Supabase'de çalıştır

---

## 📝 Özet

1. ✅ `.env.local` dosyası oluştur
2. ✅ `npm install` çalıştır (gerekirse)
3. ✅ `npm run seed` çalıştır
4. ✅ Sonuçları kontrol et

---

## 🎉 Başarılı!

Seed script başarıyla çalıştıysa, database'de örnek veriler olmalı. Artık local development'ta test edebilirsin!

