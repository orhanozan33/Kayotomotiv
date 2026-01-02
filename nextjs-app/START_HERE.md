# 🚀 Başlangıç Rehberi - Kayaotomotiv Deployment

Bu dosya, projeyi yayına almak için yapman gereken **TÜM** adımları içerir.

---

## 📋 ÖN HAZIRLIK

✅ Supabase projesi hazır: **kayaotomotiv**  
✅ GitHub repository hazır: **orhanozan33/Kayotomotiv**  
✅ Tüm dosyalar GitHub'a push edildi

---

## 🔵 ADIM 1: SUPABASE'DE YAPILACAKLAR

### ⏱️ Süre: 10 dakika

1. **Supabase Dashboard'a Git**
   - https://daruylcofjhrvjhilsuf.supabase.co
   - Giriş yap

2. **SQL Editor'e Git**
   - Sol menüden **SQL Editor**'e tıkla
   - **New query** butonuna tıkla

3. **Database Schema'yı Oluştur**
   - `SUPABASE_SETUP.md` dosyasını aç
   - İçindeki SQL kodunu kopyala
   - SQL Editor'e yapıştır
   - **RUN** butonuna tıkla (veya F5)
   - "Success" mesajını gör

4. **Connection String'i Kopyala**
   - **Settings** > **Database**'e git
   - **Connection pooling** modunu seç
   - Connection string'i kopyala (zaten hazır):
     ```
     postgresql://postgres:orhanozan33@db.daruylcofjhrvjhilsuf.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
     ```

**✅ Supabase hazır!**

---

## 🟢 ADIM 2: VERCEL'DE YAPILACAKLAR

### ⏱️ Süre: 5 dakika

1. **Vercel'e Git**
   - https://vercel.com
   - GitHub hesabınla giriş yap

2. **Proje Oluştur**
   - **Add New Project** butonuna tıkla
   - `orhanozan33/Kayotomotiv` repository'sini seç
   - **Root Directory:** `nextjs-app` ⚠️ **ÖNEMLİ!**
   - **Framework:** Next.js (otomatik)

3. **Environment Variables Ekle**
   
   **Settings** > **Environment Variables** bölümüne git ve şunları ekle:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `postgresql://postgres:orhanozan33@db.daruylcofjhrvjhilsuf.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1` |
   | `JWT_SECRET` | `omibIG1Z2H3RnMWq7aZQrjz5i3OQWKww6E5cnMEqL1k=` |
   | `BACKEND_PASSWORD_HASH` | `$2b$10$K6Ry0L33ZDOude/nR0haeukjokNzFim/nB.KJrzop7tF1mojN0fRu` |
   | `NODE_ENV` | `production` |

   **Her variable için:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **Deploy Et**
   - **Deploy** butonuna tıkla
   - 2-5 dakika bekle
   - URL'yi gör

**✅ Vercel hazır!**

---

## ✅ ADIM 3: TEST ET

1. **Ana Sayfayı Aç**
   - Deployment URL'ini aç (örn: `https://kayaotomotiv.vercel.app`)

2. **Admin Panel'i Test Et**
   - `https://[your-project].vercel.app/admin-panel/login`
   - **Şifre:** `admin123` (production'da değiştir!)

3. **Database Bağlantısını Kontrol Et**
   - Vercel dashboard'da **Functions** > **Logs**
   - `✅ Database connected successfully` mesajını ara

---

## 📚 DETAYLI REHBERLER

- **Supabase Kurulum:** `SUPABASE_SETUP.md` - Tüm Supabase adımları
- **Vercel Kurulum:** `VERCEL_SETUP.md` - Tüm Vercel adımları
- **Environment Variables:** `VERCEL_ENV_VARS.md` - Tüm variable'lar
- **Hızlı Başlangıç:** `QUICK_START.md` - 5 dakikada deployment

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Admin Şifresi:** Production'da `admin123` şifresini değiştir!
2. **Database Password:** Asla paylaşma!
3. **Root Directory:** Vercel'de mutlaka `nextjs-app` olmalı
4. **Connection Pooling:** Supabase'de `pgbouncer=true` kullan

---

## 🎉 BAŞARILI!

Eğer tüm adımları tamamladıysan, projen artık canlıda! 🚀

**Sorun mu var?**
- `SUPABASE_SETUP.md` - Supabase sorunları için
- `VERCEL_SETUP.md` - Vercel sorunları için
- Vercel **Logs** bölümünden hataları kontrol et

---

## 📞 BİLGİLER

- **Supabase:** https://daruylcofjhrvjhilsuf.supabase.co
- **GitHub:** https://github.com/orhanozan33/Kayotomotiv
- **Vercel:** Deployment sonrası URL'ini gör

