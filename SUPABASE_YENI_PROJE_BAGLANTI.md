# Supabase Yeni Proje Kurulum - qttwfdsyafvifngtsxjc

## 🎯 Yeni Supabase Projesi

**Proje ID:** `qttwfdsyafvifngtsxjc`  
**Dashboard:** https://supabase.com/dashboard/project/qttwfdsyafvifngtsxjc

---

## 📋 ADIM 1: Supabase Connection Bilgilerini Al

1. **Supabase Dashboard'a git:**
   ```
   https://supabase.com/dashboard/project/qttwfdsyafvifngtsxjc
   ```

2. **Settings > Database** bölümüne git

3. **Connection string** bilgilerini al:
   - **Host:** `db.qttwfdsyafvifngtsxjc.supabase.co`
   - **Port:** `5432` (veya Session Pooler için `6543`)
   - **Database:** `postgres`
   - **User:** `postgres`
   - **Password:** (Settings'den al)

---

## 📋 ADIM 2: SQL Editor'de Tabloları Oluştur

1. **SQL Editor'e git:**
   ```
   https://supabase.com/dashboard/project/qttwfdsyafvifngtsxjc/sql
   ```

2. **"New query"** butonuna tıkla

3. **`SUPABASE_YENI_PROJE_KURULUM.sql`** dosyasının içeriğini kopyala-yapıştır

4. **"Run"** butonuna tıkla

5. **Başarılı mesajını bekle:**
   - Tüm tablolar oluşturulacak
   - RLS kapatılacak
   - Admin user eklenecek
   - Indexes oluşturulacak

---

## 📋 ADIM 3: Vercel Environment Variables Güncelle

1. **Vercel Dashboard'a git:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
   ```

2. **Environment variables'ları güncelle:**

   ```
   DB_HOST=db.qttwfdsyafvifngtsxjc.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=[Supabase'den alınan şifre]
   ```

3. **Her birini şu environment'lara ekle:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

---

## 📋 ADIM 4: Connection Test

1. **Supabase Dashboard > Database > Connection Pooling**

2. **Connection string'i kontrol et:**
   - Direct connection: `5432`
   - Session Pooler: `6543` (IPv4 için)

3. **Vercel'de test et:**
   ```
   https://kayotomotiv.vercel.app/api/health
   ```

---

## ✅ Kontrol Listesi

- [ ] Supabase connection bilgileri alındı
- [ ] SQL script çalıştırıldı
- [ ] Tüm tablolar oluşturuldu
- [ ] RLS kapatıldı
- [ ] Admin user oluşturuldu
- [ ] Vercel environment variables güncellendi
- [ ] API bağlantısı test edildi

---

## 🔐 Admin Giriş Bilgileri

**Email:** `admin@kayoto.com`  
**Password:** `admin123`

---

## 📝 Notlar

1. **Session Pooler:** IPv4 sorunları için `6543` portunu kullan
2. **SSL:** Supabase SSL gerektirir (otomatik)
3. **RLS:** Tüm tablolarda RLS kapalı (backend kendi auth kullanıyor)

---

**SQL script'i çalıştırdıktan sonra Vercel environment variables'ları güncelleyin!** 🚀

