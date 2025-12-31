# 🔧 Vercel ENOTFOUND Hatası Çözümü

## ❌ Hata Mesajı

```
Error: { 
  message: 'getaddrinfo ENOTFOUND db.rxbtkjihvqjmamdwmsev.supabase.co', 
  code: 'ENOTFOUND', 
  statusCode: 500, 
  path: '/api/vehicles', 
  method: 'GET' 
}
```

---

## 🔍 Sorun Analizi

**`getaddrinfo ENOTFOUND`** hatası, Vercel'in Supabase host'unu DNS'ten çözümleyemediğini gösterir.

**Olası Nedenler:**
1. ❌ DB_HOST yanlış veya eksik
2. ❌ DB_PORT yanlış
3. ❌ Environment variables Production için ayarlı değil
4. ❌ DNS çözümleme sorunu
5. ❌ Vercel region sorunu

---

## ✅ Çözüm Adımları

### ADIM 1: Vercel Environment Variables Kontrol

**Vercel Dashboard:**
```
https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
```

**Kontrol Edin:**
- ✅ DB_HOST = `db.rxbtkjihvqjmamdwmsev.supabase.co`
- ✅ DB_PORT = `6543` (Session Pooler) veya `5432` (Direct)
- ✅ DB_NAME = `postgres`
- ✅ DB_USER = `postgres`
- ✅ DB_PASSWORD = `orhanozan33`

**ÖNEMLİ:** Tüm environment variables'ların **Production, Preview, Development** için ayarlı olduğundan emin olun!

---

### ADIM 2: DB_HOST Kontrol ve Düzeltme

**Eğer DB_HOST yanlışsa:**

1. **Vercel Dashboard'a git:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
   ```

2. **DB_HOST değişkenini bul**

3. **Değeri kontrol et:**
   - Doğru: `db.rxbtkjihvqjmamdwmsev.supabase.co`
   - Yanlış: `db.xlioxvlohlgpswhpjawa.supabase.co` (eski proje)
   - Yanlış: `db.qttwfdsyafvifngtsxjc.supabase.co` (eski proje)

4. **Eğer yanlışsa:**
   - "Edit" butonuna tıkla
   - Value'yu düzelt: `db.rxbtkjihvqjmamdwmsev.supabase.co`
   - Environment: Production, Preview, Development (hepsini işaretle)
   - "Save" butonuna tıkla

---

### ADIM 3: Port Kontrol (6543 vs 5432)

**Eğer Session Pooler çalışmıyorsa:**

1. **DB_PORT değişkenini bul**

2. **Değeri değiştir:**
   - Eski: `6543` (Session Pooler)
   - Yeni: `5432` (Direct Connection)

3. **Kaydet**

---

### ADIM 4: Tüm Environment Variables Kontrol

**Kontrol Listesi:**
- [ ] DB_HOST = `db.rxbtkjihvqjmamdwmsev.supabase.co`
- [ ] DB_PORT = `6543` veya `5432`
- [ ] DB_NAME = `postgres`
- [ ] DB_USER = `postgres`
- [ ] DB_PASSWORD = `orhanozan33`
- [ ] JWT_SECRET = [ayarlı]
- [ ] BACKEND_PASSWORD_HASH = [ayarlı]
- [ ] FRONTEND_URL = [ayarlı]

**ÖNEMLİ:** Her bir variable'ın **Production, Preview, Development** için ayarlı olduğundan emin olun!

---

### ADIM 5: Redeploy

**1. Vercel Dashboard:**
```
https://vercel.com/orhanozan33/kayotomotiv
```

**2. Son deployment'ı seç**

**3. "Redeploy" butonuna tıkla**

**4. 2-3 dakika bekleyin**

---

## 🔧 Alternatif Çözüm: Port 5432 Kullan

**Eğer Session Pooler (6543) çalışmıyorsa:**

1. **DB_PORT'u değiştir:**
   - `6543` → `5432`

2. **Redeploy yap**

3. **Test et:**
   ```
   https://kayotomotiv.vercel.app/api/health
   ```

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

## 📋 Kontrol Listesi

- [ ] DB_HOST doğru mu? (`db.rxbtkjihvqjmamdwmsev.supabase.co`)
- [ ] DB_PORT doğru mu? (`6543` veya `5432`)
- [ ] DB_PASSWORD doğru mu? (`orhanozan33`)
- [ ] Tüm environment variables Production için ayarlı mı?
- [ ] Tüm environment variables Preview için ayarlı mı?
- [ ] Tüm environment variables Development için ayarlı mı?
- [ ] Backend redeploy edildi mi?
- [ ] Vercel logs kontrol edildi mi?

---

## 🚨 Hala Çalışmıyorsa

**1. Vercel Logs Kontrol:**
```
https://vercel.com/orhanozan33/kayotomotiv
```

**2. Supabase Dashboard Kontrol:**
```
https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/settings/database
```

**3. Connection String Test:**
- Supabase Dashboard'dan connection string'i kopyala
- Local'de test et (zaten başarılı)

**4. Port Değiştir:**
- `6543` → `5432` (Direct Connection)

---

## ✅ Özet

**Sorun:** `getaddrinfo ENOTFOUND db.rxbtkjihvqjmamdwmsev.supabase.co`

**Çözüm:**
1. ✅ DB_HOST kontrol ve düzelt
2. ✅ DB_PORT kontrol (6543 veya 5432)
3. ✅ Tüm environment variables Production için ayarla
4. ✅ Redeploy

**En Hızlı Çözüm:** DB_HOST'u kontrol et ve tüm environment variables'ları Production için ayarla, sonra redeploy et!

