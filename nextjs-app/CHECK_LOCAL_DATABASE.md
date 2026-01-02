# 🔍 Local Database Bağlantısı Kontrolü

## ✅ Local'de Çalışıyorsa

Eğer `http://localhost:3000/api/vehicles` çalışıyorsa, muhtemelen Supabase'e bağlanıyorsun.

## 🔍 Kontrol Et

### ADIM 1: Environment Variables Kontrolü

Local'de `.env.local` veya `.env` dosyasında DATABASE_URL olmalı:

**Dosya yolu:**
```
C:\Users\orhan\OneDrive\Masaüstü\oto tamir\nextjs-app\.env.local
```
veya
```
C:\Users\orhan\OneDrive\Masaüstü\oto tamir\nextjs-app\.env
```

**İçerik örneği:**
```
DATABASE_URL=postgresql://postgres.daruylcofjhrvjhilsuf:orhanozan33@aws-1-ca-central-1.pooler.supabase.com:5432/postgres?sslmode=require
```

### ADIM 2: Terminal'de Kontrol Et

Terminal'de şu komutu çalıştır:
```powershell
cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir\nextjs-app"
Get-Content .env.local | Select-String "DATABASE_URL"
```

veya `.env` dosyası varsa:
```powershell
Get-Content .env | Select-String "DATABASE_URL"
```

### ADIM 3: Supabase Dashboard Kontrolü

1. **Supabase Dashboard** → Projeni seç (`kayotomotiv`)
2. **Table Editor** → **vehicles** tablosuna git
3. Kaç kayıt var kontrol et
4. Local'de gördüğün verilerle aynı mı?

## 📊 Sonuç

- ✅ **Local'de Supabase'e bağlanıyorsan:**
  - Vercel'de de aynı connection string'i kullanmalısın
  - Aynı verileri görmelisin

- ❌ **Local'de farklı bir database'e bağlanıyorsan:**
  - Vercel'de Supabase connection string'ini kullanmalısın
  - Veriler farklı olabilir

## 🔧 Vercel'de Aynı Connection String'i Kullan

Local'de çalışan connection string'i Vercel'de de kullan:

1. **Local `.env.local` dosyasından DATABASE_URL'i kopyala**
2. **Vercel Dashboard** → **Settings** → **Environment Variables**
3. **DATABASE_URL** → **Edit**
4. **Value** alanına local'deki connection string'i yapıştır
5. **Save**
6. **Clear cache ile redeploy**

---

**Not:** Local'de çalışıyorsa, aynı connection string'i Vercel'de de kullan. Bu kesin çalışır!

