# 🔌 Vercel Environment Variables - Database Bilgileri

## 📋 Güncel Database Bilgileri

**Proje:** kayotomotiv  
**Supabase Proje ID:** `rxbtkjihvqjmamdwmsev`  
**Güncelleme:** 2025-01-30

---

## 🔑 Environment Variables

### Database Connection

| Key | Value | Açıklama |
|-----|-------|----------|
| `DB_HOST` | `db.rxbtkjihvqjmamdwmsev.supabase.co` | Supabase database host |
| `DB_PORT` | `6543` | Session Pooler port (IPv4 için) |
| `DB_NAME` | `postgres` | Database adı |
| `DB_USER` | `postgres` | Database kullanıcı adı |
| `DB_PASSWORD` | `orhanozan33` | Database şifresi |

**NOT:** Port `6543` = Session Pooler (IPv4 için)  
**Alternatif:** Port `5432` = Direct Connection (eğer Session Pooler çalışmıyorsa)

---

### JWT Authentication

| Key | Value |
|-----|-------|
| `JWT_SECRET` | `ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b` |

---

### Backend Authentication

| Key | Value |
|-----|-------|
| `BACKEND_PASSWORD_HASH` | `$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m` |

**Password:** `admin123`

---

### Frontend URLs

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://kayotomotiv.vercel.app,https://kayotomotiv.vercel.app/admin` |

---

## 📝 Vercel Dashboard'a Ekleme

### Adım 1: Vercel Dashboard'a Git

```
https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
```

---

### Adım 2: Her Bir Variable'ı Ekle

**1. DB_HOST:**
- Key: `DB_HOST`
- Value: `db.rxbtkjihvqjmamdwmsev.supabase.co`
- Environment: ✅ Production, ✅ Preview, ✅ Development

**2. DB_PORT:**
- Key: `DB_PORT`
- Value: `6543` (veya `5432` alternatif)
- Environment: ✅ Production, ✅ Preview, ✅ Development

**3. DB_NAME:**
- Key: `DB_NAME`
- Value: `postgres`
- Environment: ✅ Production, ✅ Preview, ✅ Development

**4. DB_USER:**
- Key: `DB_USER`
- Value: `postgres`
- Environment: ✅ Production, ✅ Preview, ✅ Development

**5. DB_PASSWORD:**
- Key: `DB_PASSWORD`
- Value: `orhanozan33`
- Environment: ✅ Production, ✅ Preview, ✅ Development

**6. JWT_SECRET:**
- Key: `JWT_SECRET`
- Value: `ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b`
- Environment: ✅ Production, ✅ Preview, ✅ Development

**7. BACKEND_PASSWORD_HASH:**
- Key: `BACKEND_PASSWORD_HASH`
- Value: `$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m`
- Environment: ✅ Production, ✅ Preview, ✅ Development

**8. FRONTEND_URL:**
- Key: `FRONTEND_URL`
- Value: `https://kayotomotiv.vercel.app,https://kayotomotiv.vercel.app/admin`
- Environment: ✅ Production, ✅ Preview, ✅ Development

---

## 🔧 Import Dosyası

**`.env` formatında hazır dosya:**
```
VERCEL_ENV_DATABASE_BILGILERI.env
```

**Kullanım:**
1. Dosyayı açın
2. İçeriği kopyalayın
3. Vercel Dashboard'dan manuel olarak ekleyin

---

## ✅ Kontrol Listesi

- [ ] DB_HOST eklendi
- [ ] DB_PORT eklendi (6543 veya 5432)
- [ ] DB_NAME eklendi
- [ ] DB_USER eklendi
- [ ] DB_PASSWORD eklendi
- [ ] JWT_SECRET eklendi
- [ ] BACKEND_PASSWORD_HASH eklendi
- [ ] FRONTEND_URL eklendi
- [ ] Tüm variables Production için ayarlı
- [ ] Tüm variables Preview için ayarlı
- [ ] Tüm variables Development için ayarlı
- [ ] Deployment yeniden başlatıldı

---

## 🧪 Test

**1. Health Endpoint:**
```
https://kayotomotiv.vercel.app/api/health
```
**Beklenen:** `200 OK`

**2. Settings Endpoint:**
```
https://kayotomotiv.vercel.app/api/settings/social-media
```
**Beklenen:** `200 OK`

**3. Vehicles Endpoint:**
```
https://kayotomotiv.vercel.app/api/vehicles
```
**Beklenen:** `200 OK` (tablolar oluşturulduktan sonra)

---

## 📋 Connection String

**Format:**
```
postgresql://postgres:orhanozan33@db.rxbtkjihvqjmamdwmsev.supabase.co:6543/postgres?pgbouncer=true
```

**Detaylı:**
- Protocol: `postgresql://`
- User: `postgres`
- Password: `orhanozan33`
- Host: `db.rxbtkjihvqjmamdwmsev.supabase.co`
- Port: `6543` (Session Pooler)
- Database: `postgres`
- Options: `pgbouncer=true`

---

## 🚨 Sorun Giderme

**Eğer bağlantı başarısızsa:**

1. **Port değiştir:**
   - `6543` → `5432` (Direct Connection)

2. **SSL kontrol:**
   - Backend'de SSL aktif olmalı
   - `rejectUnauthorized: false`

3. **Vercel logs kontrol:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv
   ```

4. **Supabase Dashboard kontrol:**
   ```
   https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/settings/database
   ```

---

## ✅ Özet

**Dosya:** `VERCEL_ENV_DATABASE_BILGILERI.env`  
**Format:** `.env`  
**Kullanım:** Vercel Dashboard'dan manuel import

**Tüm environment variables'ları ekledikten sonra deployment'ı yeniden başlatın!** 🚀

