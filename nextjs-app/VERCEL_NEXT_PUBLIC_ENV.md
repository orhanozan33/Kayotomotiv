# 🔧 Vercel NEXT_PUBLIC Environment Variables

## ❌ Sorun

Localhost'ta çalışıyor ama Vercel'de çalışmıyor.

**Local'de (.env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=https://daruylcofjhrvjhilsuf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_P2Fz5NOossSvDSXa7JUDuA_6kQi9jru
```

**Vercel'de:** Bu variable'lar eksik olabilir!

## ✅ ÇÖZÜM: Vercel'de NEXT_PUBLIC Variable'ları Ekle

### ADIM 1: Vercel Dashboard

1. **Vercel Dashboard** → Projeni seç
2. **Settings** → **Environment Variables**
3. **Add New** butonuna tıkla

### ADIM 2: NEXT_PUBLIC_SUPABASE_URL Ekle

1. **Name:** `NEXT_PUBLIC_SUPABASE_URL`
2. **Value:** `https://daruylcofjhrvjhilsuf.supabase.co`
3. **Environment:** Production, Preview, Development (hepsini seç)
4. **Save**

### ADIM 3: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY Ekle

1. **Name:** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
2. **Value:** `sb_publishable_P2Fz5NOossSvDSXa7JUDuA_6kQi9jru`
3. **Environment:** Production, Preview, Development (hepsini seç)
4. **Save**

### ADIM 4: DATABASE_URL Kontrolü

Local'de çalışan connection string'i Vercel'de de kullan:

**Vercel DATABASE_URL:**
```
postgresql://postgres:orhanozan33@db.daruylcofjhrvjhilsuf.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

**Kontrol:**
- Vercel Dashboard → Settings → Environment Variables
- DATABASE_URL'in doğru olduğundan emin ol
- Local'deki connection string + `&sslmode=require` olmalı

### ADIM 5: Clear Cache ile Redeploy

1. **Vercel Dashboard** → **Deployments**
2. En üstteki deployment'ın yanındaki **⋯** → **Redeploy**
3. **⚠️ ÇOK ÖNEMLİ:** **Use existing Build Cache** işaretini KALDIR
4. **Redeploy** butonuna tıkla

### ADIM 6: Test (2-3 dakika sonra)

```
https://kayotomotiv.vercel.app/api/vehicles
```

**Beklenen:**
```json
{
  "vehicles": [...]
}
```

## 📊 Vercel Environment Variables Listesi

**Tüm Gerekli Variable'lar:**

1. ✅ **DATABASE_URL**
   ```
   postgresql://postgres:orhanozan33@db.daruylcofjhrvjhilsuf.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require
   ```

2. ✅ **NEXT_PUBLIC_SUPABASE_URL**
   ```
   https://daruylcofjhrvjhilsuf.supabase.co
   ```

3. ✅ **NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY**
   ```
   sb_publishable_P2Fz5NOossSvDSXa7JUDuA_6kQi9jru
   ```

4. ✅ **JWT_SECRET**
   ```
   (32+ karakter uzunluğunda secret key)
   ```

5. ✅ **BACKEND_PASSWORD_HASH**
   ```
   (bcrypt hash)
   ```

6. ✅ **NODE_TLS_REJECT_UNAUTHORIZED** (Opsiyonel ama önerilir)
   ```
   0
   ```

## 🔍 NEXT_PUBLIC Variable'ları Neden Önemli?

- `NEXT_PUBLIC_*` prefix'i olan variable'lar **client-side** kullanılır
- Build time'da Next.js tarafından bundle'a dahil edilir
- Vercel'de set edilmezse, client-side kod çalışmaz
- Supabase client-side işlemleri için gerekli

## ✅ Kontrol Listesi

- ✅ DATABASE_URL doğru mu? (Local'deki gibi + `&sslmode=require`)
- ✅ NEXT_PUBLIC_SUPABASE_URL var mı?
- ✅ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY var mı?
- ✅ JWT_SECRET var mı?
- ✅ BACKEND_PASSWORD_HASH var mı?
- ✅ NODE_TLS_REJECT_UNAUTHORIZED var mı? (Opsiyonel)

---

**Not:** `NEXT_PUBLIC_*` variable'ları Vercel'de mutlaka set edilmeli. Build time'da bundle'a dahil edilir ve client-side kullanılır.

