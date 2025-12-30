# ⚠️ Vercel Proje İsmi Hatası - Düzeltme

## ❌ Hata

**Project Name:** `Kayoto3321`  
**Hata:** "Project names must be lowercase"

---

## ✅ Çözüm

### Project Name'i Değiştirin

**Şu anki:** `Kayoto3321` (büyük harf var ❌)

**Değiştirin:**
```
kayoto
```

veya

```
kayoto3321
```

**ÖNEMLİ:** Sadece küçük harf kullanın!

---

## 📋 Diğer Ayarlar

### ✅ Doğru Ayarlar

1. **Framework Preset:** `Other` ✅
2. **Root Directory:** `./` ✅

### ⚠️ Build and Output Settings - Açın ve Kontrol Edin

"Build and Output Settings" bölümünü açın ve şunları kontrol edin:

- **Build Command:** `npm run build:all` (veya boş bırakın)
- **Output Directory:** `.` (sadece nokta)
- **Install Command:** Mevcut ayar (değiştirmeyin)

---

## 📋 Environment Variables

"Build and Output Settings" altında "Environment Variables" bölümünü açın ve şu 8 değişkeni ekleyin:

1. `DB_HOST` = `db.xlioxvlohlgpswhpjawa.supabase.co`
2. `DB_PORT` = `5432`
3. `DB_NAME` = `postgres`
4. `DB_USER` = `postgres`
5. `DB_PASSWORD` = `orhanozan33`
6. `JWT_SECRET` = `ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b`
7. `BACKEND_PASSWORD_HASH` = `$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m`
8. `FRONTEND_URL` = `https://kayoto.vercel.app`

**Her değişken için:** Production, Preview, Development seçin

---

## ✅ Özet

1. ✅ Project Name → `kayoto` (küçük harf)
2. ✅ Build and Output Settings → Açın ve kontrol edin
3. ✅ Environment Variables → Açın ve 8 değişken ekleyin
4. ✅ Deploy → Tıklayın

---

**Project Name'i `kayoto` olarak değiştirin ve devam edin!** 🚀

