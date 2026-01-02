# Vercel Environment Variables - Kayaotomotiv

Bu dosya, Vercel'de ayarlaman gereken environment variable'ları içerir.

## 📋 Supabase Proje Bilgileri

- **Project Name:** kayaotomotiv
- **Project URL:** https://daruylcofjhrvjhilsuf.supabase.co
- **Project Reference:** daruylcofjhrvjhilsuf
- **Database Password:** orhanozan33

## 🔑 Vercel Environment Variables

Aşağıdaki environment variable'ları Vercel dashboard'da **Settings > Environment Variables** bölümüne ekle:

### 1. DATABASE_URL

```
postgresql://postgres:orhanozan33@db.daruylcofjhrvjhilsuf.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

**Önemli:** 
- Connection pooling kullanılıyor (pgbouncer=true)
- Production için connection_limit=1 (Vercel serverless için optimize)

### 2. JWT_SECRET

```
omibIG1Z2H3RnMWq7aZQrjz5i3OQWKww6E5cnMEqL1k=
```

**Not:** Bu değer otomatik oluşturuldu. Production'da güvenlik için değiştirebilirsin.

### 3. BACKEND_PASSWORD_HASH

Admin panel şifresi için bcrypt hash. **Varsayılan şifre: `admin123`**

```
$2b$10$K6Ry0L33ZDOude/nR0haeukjokNzFim/nB.KJrzop7tF1mojN0fRu
```

**ÖNEMLİ:** 
- Production'da şifreyi değiştirmeyi unutma!
- Şifreyi değiştirmek için yeni hash oluştur:
  ```bash
  node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('yeni-sifre', 10))"
  ```

**Önemli:** Production'da şifreyi değiştirmeyi unutma!

### 4. NODE_ENV

```
production
```

### 5. FRONTEND_URL

Vercel otomatik olarak ayarlar, ama manuel de ekleyebilirsin:
```
https://[your-project].vercel.app
```

## 📝 Vercel'de Ekleme Adımları

1. Vercel dashboard'a git: https://vercel.com
2. Projeyi seç (veya yeni proje oluştur)
3. **Settings** > **Environment Variables** bölümüne git
4. Her bir variable için:
   - **Key:** Variable adı (örn: `DATABASE_URL`)
   - **Value:** Variable değeri
   - **Environment:** 
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
5. **Save** butonuna tıkla
6. Tüm variable'ları ekledikten sonra projeyi **Redeploy** et

## ⚠️ Güvenlik Notları

1. **JWT_SECRET:** En az 32 karakter olmalı, güçlü random string kullan
2. **DATABASE_URL:** Şifre içerdiği için asla GitHub'a commit etme
3. **BACKEND_PASSWORD_HASH:** Production'da güçlü bir şifre kullan
4. Tüm variable'ları Production, Preview ve Development için ayrı ayrı ayarlayabilirsin

## 🔍 Test Etme

Deployment sonrası:

1. Vercel **Functions** > **Logs** bölümüne git
2. Şu mesajı ara: `✅ Database connected successfully`
3. Eğer hata varsa, connection string'i kontrol et

## 📞 Supabase Dashboard

Supabase projen: https://daruylcofjhrvjhilsuf.supabase.co

- **SQL Editor:** Database schema oluşturmak için
- **Database Settings:** Connection string'i görmek için
- **API Settings:** API keys'i görmek için

