# Vercel Import - Adım Adım Yapılacaklar

## 📋 Şu Anda Görünen Sayfada Yapılacaklar

### ✅ 1. Framework Preset (Çerçeve Ön Ayarı)
- **Mevcut:** `▲ Other` ✅
- **Değiştirmeyin** - Bu doğru!

---

### ✅ 2. Root Directory (Kök Dizin)
- **Mevcut:** `./` ✅
- **Değiştirmeyin** - Bu doğru!

---

### ⚠️ 3. Build Command (Derleme Komutu) - DEĞİŞTİRİN!

**Şu anki:** `npm run vercel-build` or `npm run build`

**Değiştirin:**
```
npm run build:all
```

veya **boş bırakın** (Vercel otomatik algılayacak)

---

### ⚠️ 4. Output Directory (Çıktı Dizini) - DEĞİŞTİRİN!

**Şu anki:** `public` if it exists, or `.`

**Değiştirin:**
```
.
```

(Sadece nokta - root dizin)

---

### ✅ 5. Install Command (Komutu Yükle)
- **Mevcut:** `yarn install, pnpm install, npm install, or bun install` ✅
- **Değiştirmeyin** - Bu doğru!

---

### ⚠️ 6. Environment Variables (Çevresel Değişkenler) - AÇIN VE EKLEYİN!

**"Çevresel Değişkenler" bölümünü açın** (chevron'a tıklayın)

**Şu değişkenleri ekleyin:**

1. **DB_HOST**
   - Value: `db.xlioxvlohlgpswhpjawa.supabase.co`
   - Environment: Production, Preview, Development (hepsini seçin)

2. **DB_PORT**
   - Value: `5432`
   - Environment: Production, Preview, Development

3. **DB_NAME**
   - Value: `postgres`
   - Environment: Production, Preview, Development

4. **DB_USER**
   - Value: `postgres`
   - Environment: Production, Preview, Development

5. **DB_PASSWORD**
   - Value: `orhanozan33`
   - Environment: Production, Preview, Development

6. **JWT_SECRET**
   - Value: `ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b`
   - Environment: Production, Preview, Development

7. **BACKEND_PASSWORD_HASH**
   - Value: `$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m`
   - Environment: Production, Preview, Development

8. **FRONTEND_URL**
   - Value: `https://kayoto.vercel.app` (veya deployment sonrası gerçek URL)
   - Environment: Production, Preview, Development

---

### ✅ 7. Deploy Butonu

Tüm ayarları yaptıktan sonra:
- **"Deploy"** butonuna tıklayın
- Deployment tamamlanmasını bekleyin (2-3 dakika)

---

## 📝 Özet - Yapılacaklar Listesi

- [ ] Build Command'ı `npm run build:all` yapın (veya boş bırakın)
- [ ] Output Directory'yi `.` yapın
- [ ] Environment Variables bölümünü açın
- [ ] 8 adet environment variable ekleyin
- [ ] Deploy butonuna tıklayın

---

**Hazır olduğunuzda Deploy butonuna tıklayın!** 🚀

