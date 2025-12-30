# Supabase Session Pooler Kurulum - IPv4 Sorunu Çözümü

## ⚠️ Sorun

Supabase Direct Connection **IPv4 compatible değil**. Vercel IPv4 kullanıyor, bu yüzden **Session Pooler** kullanmamız gerekiyor.

---

## ✅ Çözüm: Session Pooler Kullan

### ADIM 1: Session Pooler Connection Bilgilerini Al

1. **Supabase Dashboard'a git:**
   ```
   https://supabase.com/dashboard/project/qttwfdsyafvifngtsxjc/settings/database
   ```

2. **"Connection String" sekmesine git**

3. **"Method" dropdown'undan "Session Pooler" seç**

4. **Connection bilgilerini al:**
   - **Host:** `db.qttwfdsyafvifngtsxjc.supabase.co`
   - **Port:** `6543` (Session Pooler portu)
   - **Database:** `postgres`
   - **User:** `postgres`
   - **Password:** (Settings'den al)

5. **Connection string:**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.qttwfdsyafvifngtsxjc.supabase.co:6543/postgres?pgbouncer=true
   ```

---

## 📋 ADIM 2: Vercel Environment Variables Güncelle

### Yöntem 1: Otomatik Script (Önerilen)

```powershell
powershell -ExecutionPolicy Bypass -File vercel-env-supabase-guncelle.ps1
```

### Yöntem 2: Manuel

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
   ```

2. **Environment variables'ları güncelle:**

   ```
   DB_HOST=db.qttwfdsyafvifngtsxjc.supabase.co
   DB_PORT=6543
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=[Supabase'den aldığınız şifre]
   ```

3. **Her birini şu environment'lara ekle:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

---

## 🔧 Önemli Notlar

### Session Pooler vs Direct Connection

| Özellik | Direct Connection | Session Pooler |
|---------|------------------|----------------|
| Port | 5432 | 6543 |
| IPv4 | ❌ Desteklemiyor | ✅ Destekliyor |
| Vercel | ❌ Çalışmaz | ✅ Çalışır |
| Connection Limit | Yüksek | Orta (pool size'a bağlı) |

### Vercel için Session Pooler Gerekli

Vercel serverless functions IPv4 kullanıyor, bu yüzden **Session Pooler zorunlu**.

---

## ✅ Kontrol Listesi

- [ ] Supabase Session Pooler connection bilgileri alındı
- [ ] Port: `6543` (Session Pooler)
- [ ] Vercel environment variables güncellendi
- [ ] `DB_PORT=6543` olarak ayarlandı
- [ ] Deployment test edildi

---

## 🧪 Test

1. **Vercel Dashboard > Deployments**

2. **Yeni deployment başlat** (environment variables değiştiği için)

3. **API test et:**
   ```
   https://kayotomotiv.vercel.app/api/health
   ```

4. **Admin giriş test et:**
   ```
   https://kayotomotiv.vercel.app/admin/login
   Email: admin@kayoto.com
   Password: admin123
   ```

---

**Session Pooler kullanarak IPv4 sorunu çözülecek!** 🚀

