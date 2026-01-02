# 🔧 Build Cache Sorunu - TypeORM Entity Hatası

## ❌ Sorun

Log'larda şu hata görünüyor:
```
Entity metadata for aI#images was not found. Check if you specified a correct entity object and if it's connected in the connection options.
```

Bu, build cache sorunu veya entity'lerin build sırasında doğru bundle edilmemesi anlamına geliyor.

## ✅ Çözüm: Build Cache'i Temizle ve Yeniden Deploy Et

### ADIM 1: Vercel Dashboard'a Git

1. **Vercel Dashboard** → Projeni seç
2. **Deployments** sekmesine git

### ADIM 2: Clear Cache ile Redeploy

1. En üstteki (en yeni) deployment'ı bul
2. Sağ taraftaki **⋯** (üç nokta) → **Redeploy** seçeneğine tıkla
3. **⚠️ ÇOK ÖNEMLİ:** **Use existing Build Cache** işaretini KALDIR (Clear cache)
4. **Redeploy** butonuna tıkla

### ADIM 3: Deploy Durumunu İzle

1. **Deployments** sayfasında deploy durumunu izle
2. **Building...** → **Ready** olana kadar bekle (3-5 dakika)

### ADIM 4: Test

Deploy tamamlandıktan sonra:

**API Endpoint:**
```
https://kayotomotiv.vercel.app/api/vehicles
```

**Beklenen:**
```json
{
  "vehicles": [...]
}
```

## 🔍 Alternatif Çözüm: Manuel Build Cache Temizleme

Eğer yukarıdaki çözüm işe yaramazsa:

### ADIM 1: Vercel CLI ile Build Cache Temizle

1. Terminal'de şu komutu çalıştır:
   ```bash
   vercel --version
   ```

2. Eğer Vercel CLI yüklü değilse:
   ```bash
   npm install -g vercel
   ```

3. Proje klasörüne git:
   ```bash
   cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir\nextjs-app"
   ```

4. Vercel'e login ol:
   ```bash
   vercel login
   ```

5. Build cache'i temizle ve deploy et:
   ```bash
   vercel --force
   ```

### ADIM 2: GitHub'a Push Et (Yeni Commit)

1. Proje klasörüne git:
   ```bash
   cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"
   ```

2. Yeni bir commit oluştur:
   ```bash
   git commit --allow-empty -m "Clear build cache - fix TypeORM entity issue"
   git push origin main
   ```

3. Vercel otomatik olarak yeni deploy başlatacak
4. Vercel Dashboard'da **Clear cache** seçeneğini işaretle

## 📊 Sorun Giderme

### Hala Entity Hatası Alıyorsan:

1. **Vercel Functions Logs:**
   - Yeni deploy sonrası log'ları kontrol et
   - Entity hatası hala var mı?

2. **Entity Import Kontrolü:**
   - `nextjs-app/lib/entities/index.ts` dosyasında tüm entity'ler export ediliyor mu?
   - `nextjs-app/lib/config/typeorm.ts` dosyasında tüm entity'ler import ediliyor mu?

3. **Build Logs:**
   - Vercel Dashboard → Deployments → Build Logs
   - Build sırasında hata var mı?

## ✅ Başarı Kriterleri

- ✅ Build başarılı
- ✅ `/api/vehicles` endpoint'i JSON response döndürüyor
- ✅ `/api/settings/social-media` endpoint'i JSON response döndürüyor
- ✅ Vercel Functions Logs'da entity hatası yok

---

**Not:** Build cache sorunu genellikle Vercel'in eski build cache'ini kullanmasından kaynaklanır. Clear cache ile yeniden build etmek sorunu çözer.

