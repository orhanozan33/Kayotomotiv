# 🔌 Supabase Bağlantı Yapılandırması

## ✅ Mevcut Durum

Backend **zaten Supabase'e bağlanıyor** - PostgreSQL connection string ile.

**Kullanılan:** `pg` (node-postgres) kütüphanesi

---

## 🔍 Supabase Connection Bilgilerini Al

### 1️⃣ Supabase Dashboard'a Git

**Direkt link:**
```
https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/settings/database
```

---

### 2️⃣ Connection String Bilgilerini Al

1. **"Connection String" sekmesine git**

2. **"Method" dropdown'undan "Session pooler" seç**

3. **"SHARED POOLER" butonuna tıkla**

4. **Connection string görünecek:**
   ```
   postgresql://postgres.rxbtkjihvqjmamdwmsev:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:5432/postgres?pgbouncer=true
   ```

5. **Bilgileri çıkar:**
   - **Host:** `aws-0-us-west-2.pooler.supabase.com` (veya `db.rxbtkjihvqjmamdwmsev.supabase.co`)
   - **Port:** `5432` (veya `6543` - Session Pooler için)
   - **Database:** `postgres`
   - **User:** `postgres.rxbtkjihvqjmamdwmsev` (veya `postgres`)
   - **Password:** [Connection string'den veya Settings'den al]

---

## ⚠️ ÖNEMLİ: Host Farkı

Supabase connection string'de şunu görebilirsiniz:
```
aws-0-us-west-2.pooler.supabase.com
```

Ama biz şunu kullanıyoruz:
```
db.rxbtkjihvqjmamdwmsev.supabase.co
```

**Her ikisi de çalışmalı!** Eğer bağlantı başarısızsa, Supabase Dashboard'dan gösterilen host'u kullanın.

---

## 🔧 Vercel Environment Variables Güncelle

### 1️⃣ Vercel Dashboard'a Git

```
https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
```

---

### 2️⃣ Her Variable'ı Güncelle

**DB_HOST:**
- Key: `DB_HOST`
- Value: Supabase Dashboard'dan aldığınız host
  - `aws-0-us-west-2.pooler.supabase.com` (Session Pooler)
  - VEYA `db.rxbtkjihvqjmamdwmsev.supabase.co`
- Environment: ✅ Production, ✅ Preview, ✅ Development

**DB_PORT:**
- Key: `DB_PORT`
- Value: `6543` (Session Pooler için)
  - VEYA `5432` (eğer Supabase Dashboard'da gösteriliyorsa)
- Environment: ✅ Production, ✅ Preview, ✅ Development

**DB_NAME:**
- Key: `DB_NAME`
- Value: `postgres`
- Environment: ✅ Production, ✅ Preview, ✅ Development

**DB_USER:**
- Key: `DB_USER`
- Value: `postgres.rxbtkjihvqjmamdwmsev` (Supabase format)
  - VEYA `postgres` (basit format)
- Environment: ✅ Production, ✅ Preview, ✅ Development

**DB_PASSWORD:**
- Key: `DB_PASSWORD`
- Value: Supabase Dashboard'dan aldığınız password
- Environment: ✅ Production, ✅ Preview, ✅ Development

---

## 🧪 Bağlantı Testi

### Vercel Logs'unda Göreceğiniz:

**Başarılı bağlantı:**
```
✅ Database connected successfully
✅ DB_HOST: db.rxbtkjihvqjmamdwmsev.supabase.co
✅ DB_PORT: 6543
✅ DB_NAME: postgres
✅ DB_USER: postgres
```

**Başarısız bağlantı:**
```
❌ Unexpected error on idle client
❌ Error code: ENOTFOUND
❌ Error message: getaddrinfo ENOTFOUND ...
```

---

## 📋 Kontrol Listesi

- [ ] Supabase Dashboard'dan connection string alındı
- [ ] Host bilgisi doğru mu?
- [ ] Port bilgisi doğru mu? (6543 veya 5432)
- [ ] User bilgisi doğru mu?
- [ ] Password bilgisi doğru mu?
- [ ] Vercel environment variables güncellendi
- [ ] Deployment yeniden başlatıldı
- [ ] Vercel logs kontrol edildi

---

## 🔍 Supabase Connection String Formatları

### Session Pooler (Önerilen):
```
postgresql://postgres.rxbtkjihvqjmamdwmsev:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:5432/postgres?pgbouncer=true
```

**Veya:**
```
postgresql://postgres:[PASSWORD]@db.rxbtkjihvqjmamdwmsev.supabase.co:6543/postgres?pgbouncer=true
```

---

## ✅ Özet

**Mevcut bağlantı zaten Supabase'e yapılıyor:**
- ✅ PostgreSQL connection string kullanılıyor
- ✅ `pg` kütüphanesi ile bağlanıyor
- ✅ SSL aktif
- ✅ Session Pooler portu kullanılıyor

**Yapılacaklar:**
1. Supabase Dashboard'dan doğru connection bilgilerini al
2. Vercel environment variables'ı güncelle
3. Deployment yeniden başlat
4. Vercel logs'unda bağlantı durumunu kontrol et

---

**Supabase Dashboard'dan connection bilgilerini alıp Vercel'e ekleyin!** 🔌

