# Vercel Environment Variables Import

## 📁 Dosyalar

1. **`vercel-env-import.json`** - JSON formatında environment variables
2. **`vercel-env-import.env`** - .env formatında environment variables
3. **`vercel-env-otomatik-import.ps1`** - Otomatik import script'i

---

## 🚀 Otomatik Import (Önerilen)

### PowerShell Script ile:

```powershell
powershell -ExecutionPolicy Bypass -File vercel-env-otomatik-import.ps1
```

Bu script:
- ✅ Vercel projesini bulur
- ✅ Tüm environment variables'ları ekler
- ✅ Mevcut olanları günceller
- ✅ Production, Preview, Development için ekler

---

## 📋 Manuel Import

### Vercel Dashboard'dan:

1. **Proje Settings'e git:**
   ```
   https://vercel.com/orhanozan33/kayoto/settings/environment-variables
   ```

2. **Her bir environment variable'ı ekle:**

   ```
   DB_HOST=db.xlioxvlohlgpswhpjawa.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=orhanozan33
   JWT_SECRET=ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b
   BACKEND_PASSWORD_HASH=$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m
   FRONTEND_URL=https://kayoto.vercel.app,https://kayoto.vercel.app/admin
   ```

3. **Her birini şu environment'lara ekle:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

---

## 📝 Environment Variables Listesi

| Key | Value |
|-----|-------|
| `DB_HOST` | `db.xlioxvlohlgpswhpjawa.supabase.co` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `postgres` |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | `orhanozan33` |
| `JWT_SECRET` | `ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b` |
| `BACKEND_PASSWORD_HASH` | `$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m` |
| `FRONTEND_URL` | `https://kayoto.vercel.app,https://kayoto.vercel.app/admin` |

---

## ✅ Kontrol

Environment variables eklendikten sonra:

1. **Vercel Dashboard'da kontrol et:**
   ```
   https://vercel.com/orhanozan33/kayoto/settings/environment-variables
   ```

2. **Deployment'ı yeniden başlat:**
   - Deployments > Son deployment > Redeploy

---

## 🔧 Sorun Giderme

### Script çalışmıyorsa:

1. **Vercel token kontrol et:**
   - `vercel-env-otomatik-import.ps1` dosyasında `$VERCEL_TOKEN` değerini kontrol et

2. **Proje adı kontrol et:**
   - `$PROJECT_NAME = "kayoto"` doğru mu?

3. **Manuel ekle:**
   - Vercel Dashboard'dan manuel olarak ekle

---

**Hazır! 🎉**
