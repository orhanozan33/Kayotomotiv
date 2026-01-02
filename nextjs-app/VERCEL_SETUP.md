# 🚀 Vercel Deployment - Hazır Ayarlar

Bu dosya, Vercel'de projeyi deploy etmek için gereken TÜM bilgileri içerir.

## 📋 Proje Bilgileri

- **GitHub Repository:** `orhanozan33/Kayotomotiv`
- **Root Directory:** `nextjs-app`
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

---

## 🔵 ADIM 1: Vercel'e Giriş ve Proje Oluştur

### 1.1 Vercel'e Git

1. https://vercel.com adresine git
2. GitHub hesabınla giriş yap
3. **Add New Project** butonuna tıkla

### 1.2 Repository'yi Seç

1. **Import Git Repository** bölümünden `orhanozan33/Kayotomotiv` repository'sini seç
2. **Import** butonuna tıkla

### 1.3 Proje Ayarlarını Yapılandır

**Configure Project** sayfasında:

- **Framework Preset:** Next.js (otomatik algılanır)
- **Root Directory:** `nextjs-app` ⚠️ **ÖNEMLİ!** Değiştir!
- **Build Command:** `npm run build` (otomatik)
- **Output Directory:** `.next` (otomatik)
- **Install Command:** `npm install` (otomatik)

**Root Directory'yi değiştirmek için:**
1. **Root Directory** yanındaki **Edit** butonuna tıkla
2. `nextjs-app` yaz
3. **Continue** butonuna tıkla

---

## 🔵 ADIM 2: Environment Variables Ekle

**Configure Project** sayfasında **Environment Variables** bölümüne git ve aşağıdaki variable'ları ekle:

### Variable 1: DATABASE_URL

**Key:**
```
DATABASE_URL
```

**Value:**
```
postgresql://postgres:orhanozan33@db.daruylcofjhrvjhilsuf.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

**Environments:**
- ✅ Production
- ✅ Preview
- ✅ Development

**Add** butonuna tıkla.

---

### Variable 2: JWT_SECRET

**Key:**
```
JWT_SECRET
```

**Value:**
```
omibIG1Z2H3RnMWq7aZQrjz5i3OQWKww6E5cnMEqL1k=
```

**Environments:**
- ✅ Production
- ✅ Preview
- ✅ Development

**Add** butonuna tıkla.

---

### Variable 3: BACKEND_PASSWORD_HASH

**Key:**
```
BACKEND_PASSWORD_HASH
```

**Value:**
```
$2b$10$K6Ry0L33ZDOude/nR0haeukjokNzFim/nB.KJrzop7tF1mojN0fRu
```

**Environments:**
- ✅ Production
- ✅ Preview
- ✅ Development

**Add** butonuna tıkla.

---

### Variable 4: NODE_ENV

**Key:**
```
NODE_ENV
```

**Value:**
```
production
```

**Environments:**
- ✅ Production
- ✅ Preview
- ✅ Development

**Add** butonuna tıkla.

---

### Variable 5: FRONTEND_URL (Opsiyonel)

**Key:**
```
FRONTEND_URL
```

**Value:**
```
https://[your-project].vercel.app
```

**Not:** Bu otomatik olarak ayarlanır, ama manuel de ekleyebilirsin. Deployment sonrası gerçek URL'i ekle.

**Environments:**
- ✅ Production
- ✅ Preview
- ✅ Development

---

## 🔵 ADIM 3: Deploy Et

1. Tüm environment variable'ları ekledikten sonra
2. Sayfanın en altındaki **Deploy** butonuna tıkla
3. Build sürecini bekle (2-5 dakika)
4. Deployment tamamlandığında URL'yi gör

---

## 🔵 ADIM 4: Deployment Sonrası Kontroller

### 4.1 Deployment URL'ini Kontrol Et

1. Deployment tamamlandığında bir URL göreceksin
2. Bu URL'i kopyala (örn: `https://kayaotomotiv.vercel.app`)

### 4.2 FRONTEND_URL'i Güncelle (Eğer eklediysen)

1. Vercel dashboard'da **Settings** > **Environment Variables**'a git
2. `FRONTEND_URL` variable'ını bul
3. **Edit** butonuna tıkla
4. Gerçek deployment URL'ini yapıştır
5. **Save** butonuna tıkla
6. Projeyi **Redeploy** et

### 4.3 Logs'ları Kontrol Et

1. Vercel dashboard'da **Functions** > **Logs** bölümüne git
2. Şu mesajı ara: `✅ Database connected successfully`
3. Eğer hata varsa, hata mesajını kontrol et

### 4.4 Test Et

1. Ana sayfayı aç: `https://[your-project].vercel.app`
2. Admin panel: `https://[your-project].vercel.app/admin-panel/login`
   - **Şifre:** `admin123` (production'da değiştir!)
3. API endpoint'ini test et: `https://[your-project].vercel.app/api/health`

---

## 🔧 Sorun Giderme

### Database Connection Hatası

**Hata:** `Database config missing env vars`

**Çözüm:**
1. Vercel'de **Settings** > **Environment Variables**'a git
2. `DATABASE_URL` variable'ının doğru olduğundan emin ol
3. Connection string'de `pgbouncer=true` olduğundan emin
4. Supabase projenin aktif olduğundan emin (paused değil)

**Hata:** `Connection timeout`

**Çözüm:**
1. Connection pooling kullanıldığından emin ol (`pgbouncer=true`)
2. `connection_limit=1` parametresini kontrol et
3. Supabase dashboard'da connection pooler'ın aktif olduğundan emin

### Build Hatası

**Hata:** `JWT_SECRET must be at least 32 characters`

**Çözüm:**
1. `JWT_SECRET` variable'ının en az 32 karakter olduğundan emin ol
2. Yeni bir secret oluştur: `openssl rand -base64 32`

**Hata:** `TypeORM connection failed`

**Çözüm:**
1. `DATABASE_URL`'in doğru formatında olduğundan emin
2. SSL ayarlarını kontrol et (Supabase için SSL gerekli)
3. Database schema'nın oluşturulduğundan emin (Supabase'de)

### Runtime Hatası

**Hata:** `CORS error`

**Çözüm:**
1. `vercel.json` dosyasında CORS headers tanımlı
2. Frontend URL'in doğru olduğundan emin

**Hata:** `Function timeout`

**Çözüm:**
1. `vercel.json` dosyasında `maxDuration: 30` ayarlı
2. Database query'lerini optimize et
3. Connection pool size'ı kontrol et

---

## 📝 Vercel CLI ile Deployment (Alternatif)

Eğer terminal üzerinden deploy etmek istersen:

### 1. Vercel CLI'yi Yükle

```bash
npm i -g vercel
```

### 2. Login Ol

```bash
vercel login
```

### 3. Projeye Git

```bash
cd nextjs-app
```

### 4. Deploy Et

```bash
vercel
```

### 5. Environment Variables Ekle

```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add BACKEND_PASSWORD_HASH
vercel env add NODE_ENV
```

Her birinde değeri yapıştır ve environment seç (production, preview, development).

### 6. Production Deploy

```bash
vercel --prod
```

---

## ✅ Kontrol Listesi

- [ ] Vercel'de proje oluşturuldu
- [ ] Root Directory `nextjs-app` olarak ayarlandı
- [ ] Tüm environment variable'lar eklendi
- [ ] Deployment başarılı
- [ ] Database bağlantısı çalışıyor
- [ ] Ana sayfa açılıyor
- [ ] Admin panel çalışıyor

---

## 🎉 Başarılı!

Deployment tamamlandı! Projen artık canlıda! 🚀

**Sonraki Adımlar:**
1. Admin şifresini production'da değiştir
2. Custom domain ekle (isteğe bağlı)
3. Monitoring ve logging ekle

---

## 📞 Yardım

- **Vercel Documentation:** https://vercel.com/docs
- **Supabase Documentation:** https://supabase.com/docs
- **Project Repository:** https://github.com/orhanozan33/Kayotomotiv

