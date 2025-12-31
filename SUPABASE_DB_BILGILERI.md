# 🔌 Supabase Database Bilgileri

## ✅ Supabase Bağlantısı: EKLİ

**Supabase Proje ID:** `rxbtkjihvqjmamdwmsev`

---

## 📋 Database Bağlantı Bilgileri

### Vercel Environment Variables:

**DB_HOST:**
```
db.rxbtkjihvqjmamdwmsev.supabase.co
```
✅ Production, Preview, Development için ayarlı

**DB_PORT:**
```
6543
```
✅ Session Pooler portu (IPv4 için)
✅ Production, Preview, Development için ayarlı

**DB_NAME:**
```
postgres
```
✅ Supabase default database
✅ Production, Preview, Development için ayarlı

**DB_USER:**
```
postgres
```
✅ Supabase default user
✅ Production, Preview, Development için ayarlı

**DB_PASSWORD:**
```
orhanozan33
```
✅ Supabase database password
✅ Production, Preview, Development için ayarlı

**JWT_SECRET:**
```
ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b
```
✅ Production, Preview, Development için ayarlı

---

## 🔗 Connection String

**Format:**
```
postgresql://postgres:orhanozan33@db.rxbtkjihvqjmamdwmsev.supabase.co:6543/postgres?pgbouncer=true
```

**Detaylı:**
- **Protocol:** `postgresql://`
- **User:** `postgres`
- **Password:** `orhanozan33`
- **Host:** `db.rxbtkjihvqjmamdwmsev.supabase.co`
- **Port:** `6543` (Session Pooler)
- **Database:** `postgres`
- **Options:** `pgbouncer=true`

---

## 🌐 Supabase Dashboard Linkleri

**Proje Dashboard:**
```
https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev
```

**Database Settings:**
```
https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/settings/database
```

**Table Editor:**
```
https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/editor
```

**SQL Editor:**
```
https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/sql
```

---

## 🔧 Vercel Environment Variables

**Vercel Dashboard:**
```
https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
```

**Mevcut Variables:**
- ✅ DB_HOST
- ✅ DB_PORT
- ✅ DB_NAME
- ✅ DB_USER
- ✅ DB_PASSWORD
- ✅ JWT_SECRET

---

## ✅ Bağlantı Durumu

**Backend:**
- ✅ Supabase'e bağlanıyor
- ✅ SSL aktif
- ✅ Session Pooler kullanılıyor (port 6543)
- ✅ Connection Pool yapılandırılmış

**Test Sonuçları:**
- ✅ Health endpoint: 200 OK
- ✅ Settings endpoint: 200 OK
- ❌ Vehicles endpoint: 500 hatası (muhtemelen tablo boş veya connection hatası)

---

## 🔍 Sorun Giderme

**Eğer bağlantı başarısızsa:**

1. **Vercel logs kontrol:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv
   ```

2. **Supabase Dashboard kontrol:**
   ```
   https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/settings/database
   ```

3. **Connection String kontrol:**
   - Session Pooler seçili mi?
   - Port 6543 mi?
   - Password doğru mu?

---

## 📋 Özet

**Supabase Bağlantısı:**
- ✅ EKLİ
- ✅ Environment variables ayarlı
- ✅ Connection string doğru
- ✅ SSL aktif
- ✅ Session Pooler kullanılıyor

**Yapılacaklar:**
- ⏳ Vehicles endpoint hatasını çöz
- ⏳ Supabase tablolarını kontrol et
- ⏳ Seed data ekle

---

**Supabase bağlantısı mevcut! Vercel logs'unda hata mesajını kontrol edin.** ✅

