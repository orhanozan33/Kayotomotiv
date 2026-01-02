# 🔗 Vercel'de Supabase Bağlantısı - Adım Adım Rehber

## 📋 Gereksinimler

- Vercel hesabı (GitHub ile giriş yapılmış)
- Supabase projesi hazır (`kayotomotiv`)
- GitHub repository'ye push edilmiş kod

---

## 🎯 ADIM 1: Vercel Dashboard'a Git

### 1.1 Vercel'e Giriş Yap

1. Tarayıcıda şu adresi aç: **https://vercel.com**
2. **Sign In** butonuna tıkla
3. GitHub hesabınla giriş yap

### 1.2 Projeyi Bul

1. Vercel Dashboard'da **Projects** sekmesine git
2. **Kayotomotiv** projesini bul ve tıkla
   - Eğer proje yoksa: **Add New Project** → GitHub repository'yi seç

---

## 🎯 ADIM 2: Environment Variables Ekleme

### 2.1 Environment Variables Sayfasına Git

1. Proje sayfasında **Settings** sekmesine tıkla (üst menüde)
2. Sol menüden **Environment Variables** seçeneğine tıkla

### 2.2 DATABASE_URL Ekle

1. **Add New** butonuna tıkla
2. **Key** alanına şunu yaz:
   ```
   DATABASE_URL
   ```
3. **Value** alanına şunu yapıştır:
   ```
   postgresql://postgres:orhanozan33@db.daruylcofjhrvjhilsuf.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
   ```
4. **Environment** seçeneklerinde:
   - ✅ **Production** kutusunu işaretle
   - ✅ **Preview** kutusunu işaretle
   - ✅ **Development** kutusunu işaretle
5. **Save** butonuna tıkla

### 2.3 JWT_SECRET Ekle

1. **Add New** butonuna tekrar tıkla
2. **Key** alanına şunu yaz:
   ```
   JWT_SECRET
   ```
3. **Value** alanına şunu yapıştır:
   ```
   omibIG1Z2H3RnMWq7aZQrjz5i3OQWKww6E5cnMEqL1k=
   ```
4. **Environment** seçeneklerinde:
   - ✅ **Production** kutusunu işaretle
   - ✅ **Preview** kutusunu işaretle
   - ✅ **Development** kutusunu işaretle
5. **Save** butonuna tıkla

### 2.4 BACKEND_PASSWORD_HASH Ekle

1. **Add New** butonuna tekrar tıkla
2. **Key** alanına şunu yaz:
   ```
   BACKEND_PASSWORD_HASH
   ```
3. **Value** alanına şunu yapıştır:
   ```
   $2b$10$K6Ry0L33ZDOude/nR0haeukjokNzFim/nB.KJrzop7tF1mojN0fRu
   ```
4. **Environment** seçeneklerinde:
   - ✅ **Production** kutusunu işaretle
   - ✅ **Preview** kutusunu işaretle
   - ✅ **Development** kutusunu işaretle
5. **Save** butonuna tıkla

### 2.5 Kontrol Et

Şu 3 variable'ın listede olduğundan emin ol:
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ✅ `BACKEND_PASSWORD_HASH`

---

## 🎯 ADIM 3: Root Directory Kontrolü

### 3.1 Settings Sayfasına Git

1. Sol menüden **General** seçeneğine tıkla

### 3.2 Root Directory Kontrolü

1. **Root Directory** bölümünü bul
2. Değerin `nextjs-app` olduğundan emin ol
   - Eğer farklıysa: **Edit** butonuna tıkla → `nextjs-app` yaz → **Save**

---

## 🎯 ADIM 4: Deployment'ı Yeniden Başlat

### 4.1 Deployments Sayfasına Git

1. Üst menüden **Deployments** sekmesine tıkla

### 4.2 Son Deployment'ı Bul

1. En üstteki (en yeni) deployment'ı bul
2. Sağ taraftaki **...** (üç nokta) menüsüne tıkla
3. **Redeploy** seçeneğine tıkla
4. Onayla: **Redeploy** butonuna tıkla

**VEYA**

### 4.3 Yeni Deployment Tetikle (Alternatif)

1. GitHub repository'ye git
2. Küçük bir değişiklik yap (örn: README'ye boşluk ekle)
3. Commit ve push yap
4. Vercel otomatik olarak yeni deployment başlatır

---

## 🎯 ADIM 5: Build Loglarını Kontrol Et

### 5.1 Deployment Sayfasına Git

1. **Deployments** sekmesinde en yeni deployment'ı bul
2. Üzerine tıkla (detayları görmek için)

### 5.2 Build Loglarını İncele

1. **Build Logs** sekmesine tıkla
2. Şu mesajları ara:
   - ✅ `✅ Database connected successfully` → Başarılı!
   - ❌ `❌ Database connection error` → Hata var, logları kontrol et
   - ⚠️ `⚠️ Build time: Using minimal config` → Normal, sorun değil

### 5.3 Build Durumunu Kontrol Et

- **Yeşil tik** ✅ → Build başarılı
- **Kırmızı X** ❌ → Build başarısız, hataları kontrol et

---

## 🎯 ADIM 6: Runtime Loglarını Kontrol Et

### 6.1 Functions Logs'a Git

1. Sol menüden **Functions** sekmesine tıkla
2. **Logs** sekmesine tıkla

### 6.2 Database Bağlantı Mesajlarını Ara

1. Log'larda şu mesajları ara:
   - ✅ `✅ Database connected successfully`
   - ✅ `🔍 Database Connection Config:`
   - ❌ `❌ Database connection error`

### 6.3 Hata Varsa

Eğer hata görüyorsan:
1. Hata mesajını kopyala
2. `DATABASE_URL` değerini kontrol et
3. Supabase projenin aktif olduğundan emin ol

---

## 🎯 ADIM 7: API Endpoint'ini Test Et

### 7.1 API Endpoint URL'ini Bul

1. Vercel Dashboard'da projenin URL'ini kopyala
   - Örnek: `https://kayotomotiv.vercel.app`

### 7.2 Tarayıcıda Test Et

1. Yeni bir sekme aç
2. Şu URL'yi yaz (kendi URL'ini kullan):
   ```
   https://[your-vercel-url].vercel.app/api/vehicles
   ```
3. Enter'a bas

### 7.3 Response'u Kontrol Et

**Başarılı Response:**
```json
{
  "vehicles": [...]
}
```
veya
```json
{
  "vehicles": []
}
```
(Boş array normal, veritabanında araç yoksa)

**Hata Response:**
```json
{
  "error": "..."
}
```
→ Environment variable'ları kontrol et

---

## 🎯 ADIM 8: Frontend'de Test Et

### 8.1 Ana Sayfayı Aç

1. Tarayıcıda Vercel URL'ini aç:
   ```
   https://[your-vercel-url].vercel.app
   ```

### 8.2 Araçlar Sayfasına Git

1. **Araçlar** veya **Auto Sales** linkine tıkla
2. Veya direkt şu URL'yi aç:
   ```
   https://[your-vercel-url].vercel.app/auto-sales
   ```

### 8.3 Browser Console'u Aç

1. **F12** tuşuna bas (veya sağ tık → **Inspect**)
2. **Console** sekmesine tıkla

### 8.4 Hataları Kontrol Et

Ara:
- ✅ `✅ Vehicles response:` → Başarılı!
- ❌ `❌ Error loading vehicles:` → Hata var
- ❌ `Failed to fetch` → API endpoint çalışmıyor

---

## 🎯 ADIM 9: Supabase'de Veri Kontrolü

### 9.1 Supabase Dashboard'a Git

1. **https://supabase.com/dashboard** adresine git
2. **kayotomotiv** projesini seç

### 9.2 SQL Editor'ü Aç

1. Sol menüden **SQL Editor** seçeneğine tıkla
2. **New query** butonuna tıkla

### 9.3 Araçları Kontrol Et

1. Şu SQL'i yaz:
   ```sql
   SELECT COUNT(*) FROM vehicles;
   ```
2. **RUN** butonuna tıkla
3. Sonuç:
   - `0` → Veritabanında araç yok, seed script çalıştır
   - `10` veya daha fazla → Veritabanında araç var ✅

### 9.4 Seed Script Çalıştır (Gerekirse)

Eğer araç yoksa:
1. Local'de terminal aç
2. Şu komutları çalıştır:
   ```bash
   cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir\nextjs-app"
   npm run seed
   ```
3. Seed script başarılı olursa, Vercel'de sayfayı yenile

---

## ✅ Başarı Kontrolü

### Tüm Adımlar Tamamlandı mı?

- [ ] Environment variable'lar eklendi (3 adet)
- [ ] Root Directory `nextjs-app` olarak ayarlandı
- [ ] Deployment yeniden başlatıldı
- [ ] Build başarılı (yeşil tik)
- [ ] Functions logs'da `✅ Database connected successfully` görünüyor
- [ ] `/api/vehicles` endpoint'i çalışıyor
- [ ] Frontend'de araçlar görünüyor

---

## 🚨 Sorun Giderme

### Sorun 1: Environment Variable'lar Görünmüyor

**Çözüm:**
1. Settings → Environment Variables sayfasına tekrar git
2. Her variable'ın **Production**, **Preview**, **Development** için işaretli olduğundan emin ol
3. Deployment'ı yeniden başlat

### Sorun 2: Build Başarısız

**Çözüm:**
1. Build Logs'u kontrol et
2. Hata mesajını oku
3. Genellikle environment variable eksikliği olur

### Sorun 3: Database Bağlantı Hatası

**Çözüm:**
1. `DATABASE_URL` değerini kontrol et
2. Supabase projenin aktif olduğundan emin ol
3. Connection string formatını kontrol et:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
   ```

### Sorun 4: API Endpoint 500 Hatası

**Çözüm:**
1. Functions → Logs'u kontrol et
2. Hata mesajını oku
3. Genellikle database bağlantı sorunu olur

### Sorun 5: Araçlar Görünmüyor

**Çözüm:**
1. Supabase'de araç var mı kontrol et (ADIM 9.3)
2. Eğer yoksa, seed script çalıştır (ADIM 9.4)
3. Browser console'da hata var mı kontrol et

---

## 📞 Yardım

Sorun devam ederse:
1. Vercel Functions → Logs'dan hata mesajını kopyala
2. Browser Console'dan hata mesajını kopyala
3. Bu bilgileri paylaş

---

## 🎉 Başarı!

Tüm adımlar tamamlandıysa:
- ✅ Vercel'de sayfa açılıyor
- ✅ Database bağlantısı çalışıyor
- ✅ API endpoint'leri çalışıyor
- ✅ Araçlar görünüyor

Tebrikler! 🎊

