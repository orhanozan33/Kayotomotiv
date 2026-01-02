# 🔧 Vercel DATABASE_URL Düzeltme

## ❌ Mevcut Connection String (Eksik)

```
postgresql://postgres.daruylcofjhrvjhilsuf:orhanozan33@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
```

**Sorun:** `sslmode=require` parametresi eksik!

## ✅ Doğru Connection String

**Bu string'e şu parametreyi ekle:**
```
?sslmode=require
```

**Tam Connection String:**
```
postgresql://postgres.daruylcofjhrvjhilsuf:orhanozan33@aws-1-ca-central-1.pooler.supabase.com:5432/postgres?sslmode=require
```

## 🔧 Vercel'de Güncelleme

### ADIM 1: Vercel Dashboard

1. **Vercel Dashboard** → Projeni seç
2. **Settings** → **Environment Variables**
3. **DATABASE_URL** değişkenini bul
4. **Edit** butonuna tıkla

### ADIM 2: Connection String'i Güncelle

**Mevcut (Yanlış):**
```
postgresql://postgres.daruylcofjhrvjhilsuf:orhanozan33@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
```

**Yeni (Doğru):**
```
postgresql://postgres.daruylcofjhrvjhilsuf:orhanozan33@aws-1-ca-central-1.pooler.supabase.com:5432/postgres?sslmode=require
```

5. **Value** alanına yeni connection string'i yapıştır
6. **Save** butonuna tıkla

### ADIM 3: Clear Cache ile Redeploy

1. **Vercel Dashboard** → **Deployments**
2. En üstteki deployment'ın yanındaki **⋯** → **Redeploy**
3. **⚠️ ÇOK ÖNEMLİ:** **Use existing Build Cache** işaretini KALDIR
4. **Redeploy** butonuna tıkla

### ADIM 4: Test (2-3 dakika sonra)

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

- ✅ Username: `postgres.daruylcofjhrvjhilsuf`
- ✅ Password: `orhanozan33`
- ✅ Host: `aws-1-ca-central-1.pooler.supabase.com`
- ✅ Port: `5432`
- ✅ Database: `postgres`
- ✅ **`sslmode=require` parametresi var** ← BU EKSİK!

## ⚠️ Önemli

`sslmode=require` parametresi **ZORUNLU** çünkü:
- Supabase SSL gerektirir
- SSL olmadan bağlantı başarısız olur
- TypeORM SSL ayarları `rejectUnauthorized: false` ile çalışır ama connection string'de de `sslmode=require` olmalı

---

**Not:** Connection string'in sonuna `?sslmode=require` ekle ve Vercel'de güncelle. Clear cache ile redeploy et.

