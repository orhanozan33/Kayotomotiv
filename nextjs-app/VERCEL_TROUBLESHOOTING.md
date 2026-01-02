# 🔧 Vercel Sorun Giderme Rehberi

## 📋 Hızlı Kontrol Listesi

### ✅ 1. Environment Variables Kontrolü

Vercel Dashboard → Settings → Environment Variables bölümünde şunlar olmalı:

- [ ] `DATABASE_URL` - Supabase connection string
- [ ] `JWT_SECRET` - JWT secret key
- [ ] `BACKEND_PASSWORD_HASH` - Admin şifre hash
- [ ] `NODE_ENV` - `production` (opsiyonel, otomatik ayarlanır)
- [ ] `FRONTEND_URL` - Vercel URL (opsiyonel, otomatik ayarlanır)

### ✅ 2. Root Directory Kontrolü

Vercel Dashboard → Settings → General → Root Directory:
- **Root Directory:** `nextjs-app` ⚠️ ÖNEMLİ!

### ✅ 3. Build Command Kontrolü

Vercel Dashboard → Settings → General → Build & Development Settings:
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (otomatik)
- **Install Command:** `npm install`

---

## 🚨 Yaygın Sorunlar ve Çözümleri

### Sorun 1: Build Hatası - "Cannot find module"

**Hata:**
```
Error: Cannot find module '@/...'
```

**Çözüm:**
1. `nextjs-app/tsconfig.json` dosyasını kontrol et
2. `paths` ayarlarının doğru olduğundan emin ol:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

### Sorun 2: Database Connection Error

**Hata:**
```
Error: connect ECONNREFUSED
```

**Çözüm:**
1. `DATABASE_URL` environment variable'ını kontrol et
2. Connection string formatı:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
   ```
3. Supabase projenin aktif olduğundan emin ol
4. Connection pooling kullanıldığından emin ol (`pgbouncer=true`)

### Sorun 3: Environment Variable Missing

**Hata:**
```
Environment configuration error: Database configuration missing.
```

**Çözüm:**
1. Vercel Dashboard → Settings → Environment Variables
2. Tüm gerekli variable'ları ekle
3. **Production**, **Preview**, ve **Development** için hepsini seç
4. Değişikliklerden sonra yeni bir deployment yap

### Sorun 4: Function Timeout

**Hata:**
```
Function execution exceeded timeout
```

**Çözüm:**
1. `vercel.json` dosyasında `maxDuration` ayarını kontrol et
2. Şu an 30 saniye olarak ayarlı:
   ```json
   {
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 30
       }
     }
   }
   ```
3. Gerekirse artır (max 60 saniye)

### Sorun 5: Next.js Build Error

**Hata:**
```
Error: Command "npm run build" exited with 1
```

**Çözüm:**
1. Local'de build yap ve hataları kontrol et:
   ```bash
   cd nextjs-app
   npm run build
   ```
2. TypeScript hatalarını düzelt
3. Eksik dependency'leri kontrol et
4. `package.json` dosyasını kontrol et

### Sorun 6: Image Optimization Error

**Hata:**
```
Error: Image optimization failed
```

**Çözüm:**
1. `next.config.ts` dosyasında `images.remotePatterns` kontrol et
2. Supabase domain'leri ekli olmalı:
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: '**.supabase.co',
       },
       {
         protocol: 'https',
         hostname: '**.supabase.in',
       },
     ],
   }
   ```

---

## 🔍 Debug Adımları

### 1. Vercel Logs Kontrolü

1. Vercel Dashboard → Projen → **Deployments**
2. Son deployment'ı seç
3. **Functions** sekmesine git
4. Log'ları kontrol et

### 2. API Endpoint Test

Tarayıcıda şu URL'leri test et:
- `https://[your-project].vercel.app/api/health`
- `https://[your-project].vercel.app/api/vehicles`

### 3. Database Bağlantı Testi

Vercel Logs'da şu mesajı ara:
```
✅ Database connected successfully
```

Eğer yoksa, `DATABASE_URL` yanlış olabilir.

---

## 📝 Vercel'de Yapılacaklar Checklist

### İlk Deployment Öncesi

- [ ] GitHub repository'ye push yapıldı
- [ ] Root Directory: `nextjs-app` ayarlandı
- [ ] Tüm environment variable'lar eklendi
- [ ] Local'de build başarılı (`npm run build`)

### Deployment Sonrası

- [ ] Build başarılı oldu
- [ ] Ana sayfa açılıyor
- [ ] API endpoint'ler çalışıyor
- [ ] Database bağlantısı başarılı
- [ ] Admin panel açılıyor

---

## 🆘 Hala Sorun Varsa

1. **Vercel Logs'u kontrol et:**
   - Vercel Dashboard → Projen → Deployments → Son deployment → Functions

2. **Local'de test et:**
   ```bash
   cd nextjs-app
   npm run build
   npm start
   ```

3. **Environment variable'ları tekrar kontrol et:**
   - Vercel Dashboard → Settings → Environment Variables

4. **GitHub repository'yi kontrol et:**
   - Tüm dosyalar push edildi mi?
   - `.env.local` dosyası commit edilmedi mi? (edilmemeli)

---

## 📞 Destek

Sorun devam ederse:
1. Vercel Logs'dan tam hata mesajını kopyala
2. Hangi adımda hata aldığını belirt (build, runtime, API call)
3. Environment variable'ların doğru olduğundan emin ol

