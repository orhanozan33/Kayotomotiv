# 🚀 Deployment Guide - Vercel + Supabase

Bu rehber, projeyi Vercel ve Supabase kullanarak yayına almak için adım adım talimatlar içerir.

## 📋 Ön Hazırlık

1. ✅ GitHub repository'ye push edildi
2. ✅ Vercel ve Supabase hesapları hazır
3. ✅ Environment variables hazırlanacak

## 🔵 Adım 1: Supabase Kurulumu

### 1.1 Supabase Projesi Oluştur

1. [supabase.com](https://supabase.com) adresine git
2. **New Project** butonuna tıkla
3. Proje bilgilerini gir:
   - **Name:** Kayotomotiv (veya istediğin isim)
   - **Database Password:** Güçlü bir şifre oluştur (kaydet!)
   - **Region:** En yakın bölgeyi seç
4. **Create new project** butonuna tıkla
5. Projenin hazır olmasını bekle (2-3 dakika)

### 1.2 Database Connection String Al

1. Supabase dashboard'da **Settings** > **Database** bölümüne git
2. **Connection string** bölümünü bul
3. **Connection pooling** modunu seç
4. **Session mode** yerine **Transaction mode** seç (daha iyi performans için)
5. Connection string'i kopyala:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```
   VEYA
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
   ```

### 1.3 Database Schema'yı Oluştur

1. Supabase dashboard'da **SQL Editor**'e git
2. Mevcut database schema dosyalarını çalıştır (eğer varsa)
3. Veya TypeORM entities'lerden otomatik oluşturulmasını bekle

## 🟢 Adım 2: Vercel Kurulumu

### 2.1 Vercel Projesi Oluştur

1. [vercel.com](https://vercel.com) adresine git
2. **Add New Project** butonuna tıkla
3. GitHub hesabını bağla (eğer bağlı değilse)
4. Repository'yi seç: `orhanozan33/Kayotomotiv`
5. **Import** butonuna tıkla

### 2.2 Proje Ayarlarını Yapılandır

**Project Settings:**
- **Framework Preset:** Next.js (otomatik algılanır)
- **Root Directory:** `nextjs-app` ⚠️ ÖNEMLİ!
- **Build Command:** `npm run build` (otomatik)
- **Output Directory:** `.next` (otomatik)
- **Install Command:** `npm install` (otomatik)

**Environment Variables:**
Aşağıdaki environment variable'ları ekle:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

```
JWT_SECRET=[32-karakter-uzunlugunda-guvenli-random-string]
```
JWT_SECRET oluşturmak için:
```bash
openssl rand -base64 32
```

```
BACKEND_PASSWORD_HASH=[bcrypt-hash]
```
Backend password hash oluşturmak için:
```bash
node -e "console.log(require('bcryptjs').hashSync('admin-password', 10))"
```

```
NODE_ENV=production
```

```
FRONTEND_URL=https://[your-project].vercel.app
```
(Bu otomatik olarak ayarlanır, ama manuel de ekleyebilirsin)

### 2.3 Environment Variables Ekleme

1. Vercel proje sayfasında **Settings** > **Environment Variables** bölümüne git
2. Her bir variable için:
   - **Key:** Variable adı (örn: `DATABASE_URL`)
   - **Value:** Variable değeri
   - **Environment:** Production, Preview, Development (hepsini seç)
3. **Save** butonuna tıkla
4. Tüm variable'ları ekledikten sonra **Deploy** butonuna tıkla

### 2.4 İlk Deployment

1. **Deploy** butonuna tıkla
2. Build sürecini bekle (2-5 dakika)
3. Deployment tamamlandığında URL'yi kontrol et
4. **Logs** bölümünden hataları kontrol et

## ✅ Adım 3: Doğrulama ve Test

### 3.1 Database Bağlantısını Kontrol Et

1. Vercel dashboard'da **Functions** > **Logs** bölümüne git
2. Şu mesajı ara: `✅ Database connected successfully`
3. Eğer hata varsa, connection string'i kontrol et

### 3.2 API Endpoint'lerini Test Et

1. Tarayıcıda şu URL'yi aç:
   ```
   https://[your-project].vercel.app/api/health
   ```
2. Başarılı response almalısın

### 3.3 Frontend'i Test Et

1. Ana sayfayı aç: `https://[your-project].vercel.app`
2. Sayfanın yüklendiğini kontrol et
3. Admin panel'e giriş yapmayı dene

## 🔧 Sorun Giderme

### Database Connection Hatası

**Hata:** `Database config missing env vars`
**Çözüm:**
- Vercel'de `DATABASE_URL` variable'ının doğru olduğundan emin ol
- Connection string'de `pgbouncer=true` olduğundan emin
- Supabase projenin aktif olduğundan emin (paused değil)

**Hata:** `Connection timeout`
**Çözüm:**
- Connection pooling kullan (pgbouncer=true)
- `connection_limit=1` parametresini ekle
- Supabase dashboard'da connection pooler'ın aktif olduğundan emin ol

### Build Hatası

**Hata:** `JWT_SECRET must be at least 32 characters`
**Çözüm:**
- JWT_SECRET'ı en az 32 karakter yap
- Yeni bir secret oluştur: `openssl rand -base64 32`

**Hata:** `TypeORM connection failed`
**Çözüm:**
- DATABASE_URL'in doğru formatında olduğundan emin
- SSL ayarlarını kontrol et (Supabase için SSL gerekli)
- Database schema'nın oluşturulduğundan emin

### Runtime Hatası

**Hata:** `CORS error`
**Çözüm:**
- `vercel.json` dosyasında CORS headers tanımlı
- Frontend URL'in doğru olduğundan emin

**Hata:** `Function timeout`
**Çözüm:**
- `vercel.json` dosyasında `maxDuration: 30` ayarlı
- Database query'lerini optimize et
- Connection pool size'ı kontrol et

## 📝 Sonraki Adımlar

1. ✅ Custom domain ekle (isteğe bağlı)
2. ✅ Environment variables'ı production için optimize et
3. ✅ Database backup'ları ayarla
4. ✅ Monitoring ve logging ekle
5. ✅ SSL sertifikası kontrol et (Vercel otomatik sağlar)

## 🔗 Faydalı Linkler

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables Setup](./ENV_SETUP.md)

## 💡 İpuçları

1. **Connection Pooling:** Her zaman connection pooling kullan (pgbouncer)
2. **Environment Variables:** Production, Preview ve Development için ayrı değerler kullanabilirsin
3. **Build Time:** İlk build 2-5 dakika sürebilir, sonrakiler daha hızlı
4. **Database:** Supabase free tier'da connection limit var, dikkatli kullan
5. **Logs:** Her zaman Vercel logs'ları kontrol et, hataları orada görebilirsin

## 🎉 Başarılı Deployment!

Eğer tüm adımları tamamladıysan, projen artık canlıda! 🚀

Herhangi bir sorun yaşarsan, Vercel ve Supabase documentation'larına bakabilir veya logları kontrol edebilirsin.

