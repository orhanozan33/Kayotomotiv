# ⚡ VERCEL AYARLARI - HIZLI ÖZET

## 🔧 Değiştirilmesi Gerekenler

### 1. Build Command
**Şu anki:** `npm run vercel-build` or `npm run build`  
**Değiştirin:** `npm run build:all`  
**VEYA boş bırakın**

---

### 2. Output Directory
**Şu anki:** `public` if it exists, or `.`  
**Değiştirin:** `.`  
(Sadece nokta)

---

### 3. Environment Variables
**AÇIN** ve şu 8 değişkeni ekleyin:

```
DB_HOST = db.xlioxvlohlgpswhpjawa.supabase.co
DB_PORT = 5432
DB_NAME = postgres
DB_USER = postgres
DB_PASSWORD = orhanozan33
JWT_SECRET = ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b
BACKEND_PASSWORD_HASH = $2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m
FRONTEND_URL = https://kayoto.vercel.app
```

**Her değişken için:** Production, Preview, Development seçin

---

## ✅ Değiştirmeyin

- Framework Preset: `▲ Other` ✅
- Root Directory: `./` ✅
- Install Command: Mevcut ayar ✅

---

**Ayarları yaptıktan sonra Deploy butonuna tıklayın!** 🚀

