# 🔗 Supabase Connection String - Güncel Bilgiler

## 📝 Supabase Connection Bilgileri

- **Host:** `aws-1-ca-central-1.pooler.supabase.com`
- **Port:** `5432`
- **Database:** `postgres`
- **User:** `postgres.daruylcofjhrvjhilsuf`
- **Pool Mode:** `session`

## ✅ Vercel DATABASE_URL Formatı

**Connection String:**
```
postgresql://postgres.daruylcofjhrvjhilsuf:ŞİFRE@aws-1-ca-central-1.pooler.supabase.com:5432/postgres?sslmode=require
```

⚠️ **ÖNEMLİ:**
- `ŞİFRE` yerine Supabase Dashboard'dan aldığın gerçek password'ü yaz
- Port `5432` (direkt bağlantı)
- `sslmode=require` parametresi ZORUNLU
- Pool mode `session` (pgBouncer session mode)

## 🔧 Vercel'de Güncelleme

### ADIM 1: Supabase'den Password Al

1. **Supabase Dashboard** → Projeni seç (`kayotomotiv`)
2. **Settings** → **Database**
3. **Database password** bölümüne git
4. Password'ü kopyala (veya reset et ve yeni password'ü not al)

### ADIM 2: Connection String Oluştur

**Format:**
```
postgresql://postgres.daruylcofjhrvjhilsuf:ŞİFRE@aws-1-ca-central-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**Örnek (password: `orhanozan33` ise):**
```
postgresql://postgres.daruylcofjhrvjhilsuf:orhanozan33@aws-1-ca-central-1.pooler.supabase.com:5432/postgres?sslmode=require
```

### ADIM 3: Vercel'de Güncelle

1. **Vercel Dashboard** → Projeni seç
2. **Settings** → **Environment Variables**
3. **DATABASE_URL** değişkenini bul
4. **Edit** butonuna tıkla
5. **Value** alanına tam connection string'i yapıştır:
   ```
   postgresql://postgres.daruylcofjhrvjhilsuf:ŞİFRE@aws-1-ca-central-1.pooler.supabase.com:5432/postgres?sslmode=require
   ```
6. **Save** butonuna tıkla

### ADIM 4: Clear Cache ile Redeploy

1. **Vercel Dashboard** → **Deployments**
2. En üstteki deployment'ın yanındaki **⋯** → **Redeploy**
3. **⚠️ ÇOK ÖNEMLİ:** **Use existing Build Cache** işaretini KALDIR
4. **Redeploy** butonuna tıkla

### ADIM 5: Test (2-3 dakika sonra)

```
https://kayotomotiv.vercel.app/api/vehicles
```

**Beklenen:**
```json
{
  "vehicles": [...]
}
```

## 🔍 Kontrol Listesi

- ✅ Host: `aws-1-ca-central-1.pooler.supabase.com`
- ✅ Port: `5432`
- ✅ Database: `postgres`
- ✅ User: `postgres.daruylcofjhrvjhilsuf`
- ✅ Password: Supabase Dashboard'dan alınan password
- ✅ `sslmode=require` parametresi var
- ✅ Başta/sonda whitespace yok

## ⚠️ Notlar

1. **Port 5432:** Direkt bağlantı portu (pooler portu 6543 değil)
2. **Pool Mode Session:** pgBouncer session mode kullanılıyor
3. **SSL Zorunlu:** `sslmode=require` parametresi mutlaka olmalı
4. **Password:** Supabase Dashboard'dan alınan password'ü kullan

---

**Not:** Password'ü Supabase Dashboard'dan al ve connection string'e ekle. Sonra Vercel'de güncelle ve clear cache ile redeploy et.

