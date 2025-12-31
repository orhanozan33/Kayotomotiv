# Admin Giriş 500 Hatası - Çözüm

## 🔍 Sorun

Admin giriş yapınca `/api/auth/login` endpoint'i **500 Internal Server Error** veriyor.

## 🔍 Olası Nedenler

1. **Database Connection Hatası**
   - Supabase bağlantısı başarısız
   - Environment variables eksik/yanlış
   - Session Pooler portu yanlış

2. **Users Tablosu Yok**
   - SQL script çalıştırılmamış
   - Migration'lar yapılmamış

3. **JWT_SECRET Eksik**
   - Token oluşturulamıyor

4. **Environment Variables Eksik**
   - DB_PASSWORD eksik
   - DB_HOST yanlış

---

## ✅ Çözüm Adımları

### 1. Vercel Logs Kontrol Et

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv
   ```

2. **Son deployment'ı seç**

3. **Logs sekmesine git**

4. **Runtime logs'u kontrol et:**
   - `/api/auth/login` isteği yapıldığında
   - Hata mesajlarını oku

### 2. Environment Variables Kontrol Et

**Vercel Dashboard > Settings > Environment Variables:**

```
DB_HOST=db.rxbtkjihvqjmamdwmsev.supabase.co
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[Supabase'den alınan şifre]
JWT_SECRET=ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b
```

**Her birini şu environment'lara ekle:**
- ✅ Production
- ✅ Preview
- ✅ Development

### 3. Supabase SQL Script Çalıştır

1. **SQL Editor:**
   ```
   https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/sql
   ```

2. **`SUPABASE_PROJE_rxbtkjihvqjmamdwmsev_KURULUM.sql` dosyasını çalıştır**

3. **Tabloları kontrol et:**
   - `users` tablosu var mı?
   - Admin user var mı?

### 4. Supabase Password Kontrol

1. **Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/settings/database
   ```

2. **Connection String > Session Pooler**

3. **Password'u kopyala**

4. **Vercel'e ekle:**
   - Key: `DB_PASSWORD`
   - Value: [Supabase password]
   - Environment: Production, Preview, Development

---

## 🧪 Test

1. **Vercel deployment'ı bekle** (environment variables değişti)

2. **Admin giriş:**
   ```
   https://kayotomotiv.vercel.app/admin/login
   Email: admin@kayoto.com
   Password: admin123
   ```

3. **Vercel logs'u kontrol et:**
   - Hata mesajı hala var mı?
   - Database connection başarılı mı?

---

## 📋 Kontrol Listesi

- [ ] SQL script çalıştırıldı mı?
- [ ] Users tablosu var mı?
- [ ] Admin user oluşturuldu mu?
- [ ] Supabase password alındı mı?
- [ ] Vercel `DB_PASSWORD` eklendi mi?
- [ ] `DB_PORT=6543` (Session Pooler) mi?
- [ ] `JWT_SECRET` var mı?
- [ ] Vercel logs kontrol edildi mi?

---

**Logs'taki hata mesajını paylaş, birlikte çözelim!** 🔍

