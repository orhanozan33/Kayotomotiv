# 🔍 Vercel Error Debug - Internal Server Error

## ❌ Sorun

```
{"error":"Internal server error"}
https://kayotomotiv.vercel.app/api/vehicles
```

---

## 🔍 ADIM 1: Vercel Functions Logs Kontrolü (ÖNCE BUNU YAP)

### 1.1 Vercel Dashboard'a Git

1. **https://vercel.com** → Projeni seç
2. **Functions** → **Logs** sekmesine git

### 1.2 Son Log'ları Kontrol Et

1. En son log'ları görüntüle
2. Şu hataları ara:
   - `❌ Database initialization error:`
   - `❌ Database connection error`
   - `self-signed certificate`
   - `ENOTFOUND`
   - `Error:`

### 1.3 Tam Hata Mesajını Kopyala

Eğer hata görüyorsan, tam hata mesajını not al ve paylaş.

---

## 🔍 ADIM 2: DATABASE_URL Kontrolü

### 2.1 Vercel Dashboard'a Git

1. **Settings** → **Environment Variables**

### 2.2 DATABASE_URL'i Kontrol Et

**DATABASE_URL** variable'ının şu formatta olduğundan emin ol:
```
postgresql://postgres.qttwfdsyafvifngtsxjc:orhanozan33@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

**ÖNEMLİ KONTROLLER:**
- [ ] `postgres.qttwfdsyafvifngtsxjc` (project reference doğru mu?)
- [ ] `orhanozan33` (password doğru mu? `ŞİFRE` değil!)
- [ ] `pooler.supabase.com` (pooler kullanılıyor mu?)
- [ ] `6543` (port doğru mu?)
- [ ] `pgbouncer=true` (var mı?)
- [ ] `sslmode=require` (var mı?)

### 2.3 Password Kontrolü

**YANLIŞ:**
```
postgresql://postgres.qttwfdsyafvifngtsxjc:ŞİFRE@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

**DOĞRU:**
```
postgresql://postgres.qttwfdsyafvifngtsxjc:orhanozan33@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

---

## 🔍 ADIM 3: Supabase Connection String'i Tekrar Al

### 3.1 Supabase Dashboard'a Git

1. **https://supabase.com/dashboard** → Projeni seç
2. **Settings** → **Database**

### 3.2 Connection String'i Kopyala

1. **Connection string** bölümünde **Connection pooling** modunu seç
2. **URI** formatını seç
3. Connection string'i kopyala

### 3.3 Password'ü Değiştir

1. Kopyaladığın connection string'de `[YOUR-PASSWORD]` veya `[PASSWORD]` kısmını bul
2. `orhanozan33` ile değiştir
3. Sonuna `&sslmode=require` ekle (yoksa)

---

## 🔍 ADIM 4: Test Connection String'i

### 4.1 Local'de Test Et (Opsiyonel)

Eğer local'de test etmek istersen:
```bash
cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir\nextjs-app"
npm run dev
```

Sonra tarayıcıda: `http://localhost:3000/api/vehicles`

### 4.2 Vercel'de Test Et

1. Vercel'de DATABASE_URL'i güncelle
2. Redeploy yap
3. Functions Logs'u kontrol et

---

## 🚨 YAYGIN SORUNLAR

### Sorun 1: Password Yanlış

**Hata:** `password authentication failed`

**Çözüm:**
- Connection string'de `ŞİFRE` yerine `orhanozan33` yaz
- Supabase Dashboard → Settings → Database'den password'ü kontrol et

### Sorun 2: Host Adresi Yanlış

**Hata:** `ENOTFOUND` veya `getaddrinfo ENOTFOUND`

**Çözüm:**
- Supabase Dashboard'dan connection string'i tekrar al
- Project reference'ın doğru olduğundan emin ol

### Sorun 3: SSL Sertifika Hatası

**Hata:** `self-signed certificate in certificate chain`

**Çözüm:**
- Connection string'in sonunda `&sslmode=require` olmalı
- Kod tarafında `rejectUnauthorized: false` zaten var ✅

---

## 📞 YARDIM

Şunları paylaş:
1. Vercel Functions Logs'dan tam hata mesajı
2. DATABASE_URL'in ilk 50 karakteri (password hariç):
   ```
   postgresql://postgres.qttwfdsyafvifngtsxjc:***@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
   ```
3. Supabase Dashboard'dan aldığın connection string (password hariç)

---

## ✅ BAŞARI KONTROLÜ

Tüm adımlar tamamlandıysa:
- [ ] Vercel Functions Logs'da `✅ Database connected successfully` görünüyor
- [ ] `/api/vehicles` endpoint'i çalışıyor (500 hatası yok)
- [ ] JSON response geliyor

