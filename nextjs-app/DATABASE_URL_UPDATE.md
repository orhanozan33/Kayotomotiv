# 🔧 DATABASE_URL Güncelleme - Yeni Format

## 📝 Yeni Connection String

Supabase'den aldığın connection string:
```
postgresql://postgres.daruylcofjhrvjhilsuf:[YOUR-PASSWORD]@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
```

## ✅ Doğru Format (Vercel için)

**Bu string'e şu parametreleri ekle:**
```
?sslmode=require
```

**Tam Connection String:**
```
postgresql://postgres.daruylcofjhrvjhilsuf:ŞİFRE@aws-1-ca-central-1.pooler.supabase.com:5432/postgres?sslmode=require
```

⚠️ **ÖNEMLİ:**
- `[YOUR-PASSWORD]` yerine Supabase Dashboard'dan aldığın gerçek password'ü yaz
- Port `5432` (direkt bağlantı, pooler değil)
- `sslmode=require` parametresi ZORUNLU
- `pgbouncer=true` gerekmez (port 5432 kullanıyoruz)

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

- ✅ Password doğru mu? (Supabase Dashboard'dan kontrol et)
- ✅ Port `5432` mi? (direkt bağlantı)
- ✅ Host `pooler.supabase.com` mi?
- ✅ `sslmode=require` parametresi var mı?
- ✅ Başta/sonda whitespace yok mu?

## ⚠️ Not

Port `5432` kullanıyoruz (direkt bağlantı), pooler portu (`6543`) değil. Bu yüzden `pgbouncer=true` parametresi gerekmez.

---

**Not:** Password'ü Supabase Dashboard'dan al ve connection string'e ekle. Sonra Vercel'de güncelle ve clear cache ile redeploy et.

