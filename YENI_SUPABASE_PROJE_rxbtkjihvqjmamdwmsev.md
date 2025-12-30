# 🚀 Yeni Supabase Projesi Kurulum - rxbtkjihvqjmamdwmsev

## 🎯 Yeni Proje Bilgileri

**Proje ID:** `rxbtkjihvqjmamdwmsev`  
**Dashboard:** https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev  
**Durum:** Building (hazır olmasını bekleyin)

---

## ⏳ Proje Hazır Olunca Yapılacaklar

### 1️⃣ Supabase SQL Script Çalıştır

1. **SQL Editor'e git:**
   ```
   https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/sql
   ```

2. **"New query" butonuna tıkla**

3. **`SUPABASE_PROJE_rxbtkjihvqjmamdwmsev_KURULUM.sql` dosyasını aç**

4. **Tüm içeriği kopyala-yapıştır**

5. **"Run" butonuna tıkla**

6. **✅ Başarılı mesajını bekle**

---

### 2️⃣ Supabase Password Al

1. **Settings > Database:**
   ```
   https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/settings/database
   ```

2. **Connection String sekmesine git**

3. **"Session Pooler" seç** (IPv4 için gerekli)

4. **Password'u kopyala**

---

### 3️⃣ Vercel Environment Variables Güncelle

#### Otomatik (Önerilen):

```powershell
powershell -ExecutionPolicy Bypass -File vercel-env-yeni-supabase-rxbtkjihvqjmamdwmsev.ps1
```

#### Manuel:

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
   ```

2. **Şu değişkenleri güncelle:**

   ```
   DB_HOST=db.rxbtkjihvqjmamdwmsev.supabase.co
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

## ✅ Hazır Dosyalar

- ✅ `SUPABASE_PROJE_rxbtkjihvqjmamdwmsev_KURULUM.sql` - SQL script
- ✅ `vercel-env-yeni-supabase-rxbtkjihvqjmamdwmsev.ps1` - Otomatik güncelleme script'i

---

## 🔐 Admin Giriş Bilgileri

SQL script çalıştırıldıktan sonra:
- **Email:** `admin@kayoto.com`
- **Password:** `admin123`

---

## ⚠️ ÖNEMLİ: Session Pooler Kullan!

**IPv4 sorunu için Session Pooler zorunlu:**
- Port: `6543` (Session Pooler) ✅
- Port: `5432` (Direct Connection) ❌ IPv4 desteklemiyor

---

## 📋 Kontrol Listesi

- [ ] Supabase projesi hazır (Building tamamlandı)
- [ ] SQL script çalıştırıldı
- [ ] Tüm tablolar oluşturuldu
- [ ] RLS kapatıldı
- [ ] Admin user oluşturuldu
- [ ] Supabase password alındı
- [ ] Vercel environment variables güncellendi
- [ ] `DB_PORT=6543` (Session Pooler)
- [ ] Deployment test edildi

---

**Proje hazır olunca SQL script'i çalıştırın!** 🚀

