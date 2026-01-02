# 🔗 Shared Pooler Connection String - Vercel için DOĞRU

## ✅ Kullanılacak Connection String

**Shared Pooler (Alttaki - IPv4 Compatible):**

```
postgresql://postgres.daruylcofjhrvjhilsuf:[YOUR-PASSWORD]@aws-1-ca-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

## 📝 Vercel Environment Variables

### ADIM 1: Supabase'den Password Al

1. **Supabase Dashboard** → Projeni seç (`kayotomotiv`)
2. **Settings** → **Database**
3. **Database password** bölümüne git
4. Password'ü kopyala (veya reset et ve yeni password'ü not al)

### ADIM 2: Connection String Oluştur

**Format:**
```
postgresql://postgres.daruylcofjhrvjhilsuf:ŞİFRE@aws-1-ca-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

**Örnek (password: `orhanozan33`):**
```
postgresql://postgres.daruylcofjhrvjhilsuf:orhanozan33@aws-1-ca-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

⚠️ **ÖNEMLİ:**
- Username: `postgres.daruylcofjhrvjhilsuf` (nokta ile)
- Host: `aws-1-ca-central-1.pooler.supabase.com` (region farklı olabilir, Supabase Dashboard'dan kontrol et)
- Port: `6543` (pgBouncer portu)
- Database: `postgres`
- Parameters: `pgbouncer=true&connection_limit=1&sslmode=require`

### ADIM 3: Vercel'de Güncelle

1. **Vercel Dashboard** → Projeni seç
2. **Settings** → **Environment Variables**
3. **DATABASE_URL** değişkenini bul
4. **Edit** butonuna tıkla
5. **Value** alanına yeni connection string'i yapıştır
6. **Save** butonuna tıkla

### ADIM 4: Region Kontrolü

Supabase Dashboard'da gösterilen region'u kontrol et:
- `aws-1-ca-central-1` (Kanada)
- `aws-1-us-east-1` (ABD Doğu)
- veya başka bir region

**Eğer region farklıysa:**
- Supabase Dashboard'dan gösterilen region'u kullan
- Connection string'deki `aws-1-ca-central-1` kısmını değiştir

### ADIM 5: Redeploy

1. **Vercel Dashboard** → **Deployments**
2. En üstteki deployment'ın yanındaki **⋯** → **Redeploy**
3. **Use existing Build Cache** işaretini KALDIR (Clear cache)
4. **Redeploy** butonuna tıkla

## 🔍 Neden Shared Pooler?

✅ **IPv4 Compatible** - Vercel IPv4 kullanıyor
✅ **DNS sorunları yok** - Daha önce `ENOTFOUND` hataları aldık
✅ **Vercel için önerilen** - Serverless ortamlar için optimize edilmiş
✅ **Connection pooling** - Daha iyi performans

## ❌ Dedicated Pooler Neden Kullanılmamalı?

❌ **IPv4 uyumlu değil** - Vercel'de sorun çıkarabilir
❌ **DNS hataları** - `ENOTFOUND` hataları alabilirsin
❌ **Serverless için optimize değil** - Vercel serverless ortamı için uygun değil

## 📊 Test

Deploy tamamlandıktan sonra:

```
https://kayotomotiv.vercel.app/api/vehicles
```

**Beklenen:**
```json
{
  "vehicles": [...]
}
```

---

**Not:** Shared Pooler connection string'ini kullan ve password'ü Supabase Dashboard'dan doğru şekilde al.

