# Vercel'de Backend ve Backoffice Görünmüyor - Çözüm

## 🔍 Sorun

1. **Backend API çalışmıyor** - `/api` endpoint'i `FUNCTION_INVOCATION_FAILED` hatası veriyor
2. **Backoffice görünmüyor** - Vercel Dashboard'da görünmüyor
3. **dist klasörü boş** - Build çıktısı yok

---

## ✅ Çözüm

### 1. Backend API Düzeltmesi

**Sorun:** `api/index.js` dosyası Vercel tarafından serverless function olarak algılanmıyor.

**Çözüm:**
- `vercel.json`'da routing düzeltildi
- `/api/(.*)` → `/api/index` (`.js` uzantısı olmadan)

### 2. Backoffice Routing Düzeltmesi

**Sorun:** `/admin` route'u doğru yönlendirilmiyor.

**Çözüm:**
- `vercel.json`'da `/admin` ve `/admin/(.*)` route'ları eklendi
- Her ikisi de `/admin/index.html`'e yönlendiriyor

### 3. Build Çıktısı

**Sorun:** `dist` klasörü boş.

**Çözüm:**
- Build script'leri doğru çalışıyor
- Vercel build sırasında `dist` klasörü oluşturulacak

---

## 📋 Yapılan Değişiklikler

### `vercel.json` Güncellendi:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    },
    {
      "source": "/admin",
      "destination": "/admin/index.html"
    },
    {
      "source": "/admin/(.*)",
      "destination": "/admin/index.html"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🧪 Test

Deployment tamamlandıktan sonra:

1. **Backend API:**
   ```
   https://kayotomotiv.vercel.app/api
   https://kayotomotiv.vercel.app/api/health
   ```

2. **Backoffice:**
   ```
   https://kayotomotiv.vercel.app/admin
   ```

3. **Frontend:**
   ```
   https://kayotomotiv.vercel.app
   ```

---

## ⚠️ Önemli Notlar

1. **API Endpoint:** `/api/index` (`.js` uzantısı olmadan)
2. **Backoffice:** `/admin/index.html` (SPA routing için)
3. **Build:** `dist` klasörü build sırasında oluşturulacak

---

## 🔧 Sorun Devam Ederse

1. **Vercel Dashboard'da kontrol edin:**
   - Settings > Build & Development Settings
   - Build Command: `npm run build:all`
   - Output Directory: `dist`

2. **Deployment logs'u kontrol edin:**
   - Build başarılı mı?
   - `dist` klasörü oluşturuldu mu?
   - `api/index.js` kopyalandı mı?

3. **Manuel test:**
   ```powershell
   # Backend test
   Invoke-WebRequest -Uri "https://kayotomotiv.vercel.app/api" -Method GET
   
   # Backoffice test
   Invoke-WebRequest -Uri "https://kayotomotiv.vercel.app/admin" -Method GET
   ```

---

**Deployment tamamlandıktan sonra test edin!** 🚀

