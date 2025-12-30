# 🚀 Hızlı Supabase Kurulum - Yeni Proje

## ⚡ Hızlı Adımlar

### 1️⃣ Supabase SQL Script Çalıştır

1. **SQL Editor'e git:**
   ```
   https://supabase.com/dashboard/project/qttwfdsyafvifngtsxjc/sql
   ```

2. **"New query" butonuna tıkla**

3. **`SUPABASE_YENI_PROJE_KURULUM.sql` dosyasını aç ve içeriğini kopyala**

4. **SQL Editor'e yapıştır ve "Run" butonuna tıkla**

5. **✅ Başarılı mesajını bekle**

---

### 2️⃣ Supabase Password Al

1. **Settings > Database:**
   ```
   https://supabase.com/dashboard/project/qttwfdsyafvifngtsxjc/settings/database
   ```

2. **Connection String sekmesine git**

3. **"Session Pooler" seç** (IPv4 için gerekli)

4. **Password'u kopyala** (connection string'den veya Settings'den)

---

### 3️⃣ Vercel Environment Variables Güncelle

#### Otomatik (Önerilen):

```powershell
powershell -ExecutionPolicy Bypass -File vercel-env-supabase-guncelle.ps1
```

Script çalıştırıldığında password soracak, gir veya Enter'a bas (manuel eklemek için).

#### Manuel:

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
   ```

2. **Şu değişkenleri güncelle:**

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

### 4️⃣ Test Et

1. **Vercel deployment'ı bekle** (environment variables değişti)

2. **API test:**
   ```
   https://kayotomotiv.vercel.app/api/health
   ```

3. **Admin giriş:**
   ```
   https://kayotomotiv.vercel.app/admin/login
   Email: admin@kayoto.com
   Password: admin123
   ```

---

## ⚠️ ÖNEMLİ: Session Pooler Kullan!

**IPv4 sorunu için Session Pooler zorunlu:**
- Port: `6543` (Session Pooler)
- Port: `5432` (Direct Connection) ❌ IPv4 desteklemiyor

---

## ✅ Kontrol Listesi

- [ ] SQL script çalıştırıldı
- [ ] Tüm tablolar oluşturuldu
- [ ] Admin user oluşturuldu
- [ ] Supabase password alındı
- [ ] Vercel environment variables güncellendi
- [ ] `DB_PORT=6543` (Session Pooler)
- [ ] Deployment test edildi

---

**Hazır! 🎉**

