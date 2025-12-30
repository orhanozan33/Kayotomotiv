# Vercel Build Debug Rehberi

## Sorun
Vercel build sonrası `dist` klasörünü bulamıyor.

## Yapılanlar

1. ✅ Build script güncellendi
   - `clean-dist`: Root'ta dist temizleniyor
   - `verify-dist`: Build sonrası dist'in var olduğu doğrulanıyor
   - Detaylı log'lar eklendi

2. ✅ Vite config'ler güncellendi
   - Absolute path kullanıyor
   - Frontend → `../dist`
   - Backoffice → `../dist/admin`

3. ✅ vercel.json güncellendi
   - `outputDirectory: "dist"` ✅

## Vercel Dashboard'da Kontrol

1. **Build Log'larını Kontrol Edin:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv/deployments
   ```
   - En son deployment'a tıklayın
   - "Logs" sekmesine gidin
   - Build log'larını kontrol edin:
     - `✅ Dist cleaned at:` görünüyor mu?
     - `✅ Dist verified at:` görünüyor mu?
     - `✅ Files in dist:` görünüyor mu?

2. **Build Başarısız Oluyorsa:**
   - Hata mesajını kontrol edin
   - Frontend veya backoffice build hatası var mı?

3. **Build Başarılı Ama Dist Bulunamıyorsa:**
   - Vercel Dashboard → Settings → Build & Development Settings
   - Output Directory: `dist` olduğundan emin olun
   - Save edin ve redeploy edin

## Alternatif Çözüm

Eğer hala çalışmazsa, Vercel Dashboard'da:

1. **Settings → Build & Development Settings**
2. **Output Directory:** Boş bırakın (veya `.` yapın)
3. **vercel.json'da:** `outputDirectory` kaldırın
4. **Build Command:** `npm run build:all && ls -la dist` (Linux) veya `npm run build:all && dir dist` (Windows)

---

**Build log'larını kontrol edip, hangi adımda hata olduğunu görelim!**

