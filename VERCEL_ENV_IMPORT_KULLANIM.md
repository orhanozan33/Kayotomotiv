# Vercel Environment Variables Import Kullanımı

## 📋 Hazır Dosyalar

1. **vercel-env-import.env** - .env formatında (manuel kopyala-yapıştır için)
2. **vercel-env-import.json** - JSON formatında
3. **vercel-env-import.ps1** - Otomatik import script'i

---

## 🚀 YÖNTEM 1: Otomatik Import (ÖNERİLEN ✅)

### PowerShell Script ile:

```powershell
cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"
powershell -ExecutionPolicy Bypass -File "vercel-env-import.ps1"
```

Bu script:
- ✅ Tüm environment variables'ı otomatik ekler
- ✅ Production, Preview, Development için hepsini ayarlar
- ✅ Zaten varsa günceller

---

## 🚀 YÖNTEM 2: Manuel Import (Vercel Dashboard)

### ADIM 1: Environment Variables Bölümünü Açın

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33-1123s-projects/kayoto/settings/environment-variables
   ```

2. **"Add New"** butonuna tıklayın

### ADIM 2: Her Değişkeni Tek Tek Ekleyin

**vercel-env-import.env** dosyasını açın ve her satırı kopyalayıp ekleyin:

1. **DB_HOST**
   - Key: `DB_HOST`
   - Value: `db.xlioxvlohlgpswhpjawa.supabase.co`
   - Environment: Production, Preview, Development (hepsini seçin)

2. **DB_PORT**
   - Key: `DB_PORT`
   - Value: `5432`
   - Environment: Production, Preview, Development

3. **DB_NAME**
   - Key: `DB_NAME`
   - Value: `postgres`
   - Environment: Production, Preview, Development

4. **DB_USER**
   - Key: `DB_USER`
   - Value: `postgres`
   - Environment: Production, Preview, Development

5. **DB_PASSWORD**
   - Key: `DB_PASSWORD`
   - Value: `orhanozan33`
   - Environment: Production, Preview, Development

6. **JWT_SECRET**
   - Key: `JWT_SECRET`
   - Value: `ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b`
   - Environment: Production, Preview, Development

7. **BACKEND_PASSWORD_HASH**
   - Key: `BACKEND_PASSWORD_HASH`
   - Value: `$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m`
   - Environment: Production, Preview, Development

8. **FRONTEND_URL**
   - Key: `FRONTEND_URL`
   - Value: `https://kayoto.vercel.app`
   - Environment: Production, Preview, Development

---

## 🚀 YÖNTEM 3: Vercel CLI ile (Alternatif)

```powershell
cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"
vercel env add DB_HOST production
# Value: db.xlioxvlohlgpswhpjawa.supabase.co

vercel env add DB_PORT production
# Value: 5432

# ... (her değişken için tekrarlayın)
```

---

## ✅ Önerilen Yöntem

**Otomatik Script kullanın:**
```powershell
powershell -ExecutionPolicy Bypass -File "vercel-env-import.ps1"
```

Bu en hızlı ve en güvenli yöntem!

---

**Hazır olduğunuzda script'i çalıştırın!** 🚀

