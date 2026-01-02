# 📦 Supabase Storage Kurulum Rehberi

## ❌ Sorun

Vercel'de dosya sistemi read-only olduğu için `public/uploads` klasörüne yazma yapılamıyor. Bu yüzden resim yükleme çalışmıyor.

## ✅ Çözüm: Supabase Storage

Supabase Storage kullanarak resimleri cloud'da saklayacağız.

---

## 📋 ADIM 1: Supabase Storage Bucket Oluştur

### 1. Supabase Dashboard'a Git

1. **Supabase Dashboard**: https://supabase.com/dashboard
2. Projeni seç: `kayotomotiv` (veya proje adın)

### 2. Storage Bucket Oluştur

1. Sol menüden **Storage** → **Buckets** seç
2. **New bucket** butonuna tıkla
3. **Bucket name**: `vehicle-images`
4. **Public bucket**: ✅ **AÇIK** (resimlerin public erişilebilir olması için)
5. **Create bucket** butonuna tıkla

### 3. Storage Policies Ayarla (Opsiyonel - Güvenlik için)

1. **Storage** → **Policies** → `vehicle-images` bucket'ını seç
2. **New Policy** → **For full customization**
3. Policy adı: `Allow public read access`
4. Policy definition:
   ```sql
   -- Allow public read access
   (bucket_id = 'vehicle-images'::text)
   ```
5. **Save policy**

---

## 📋 ADIM 2: Supabase Service Role Key Al

### 1. Supabase Dashboard → Settings → API

1. **Settings** → **API** sekmesine git
2. **Project API keys** bölümünde:
   - **service_role** key'i kopyala (⚠️ Gizli tut!)
   - Bu key server-side işlemler için kullanılacak

---

## 📋 ADIM 3: Vercel Environment Variables Ekle

### 1. Vercel Dashboard

1. **Vercel Dashboard** → Projeni seç
2. **Settings** → **Environment Variables**

### 2. SUPABASE_SERVICE_ROLE_KEY Ekle

1. **Add New**
2. **Name**: `SUPABASE_SERVICE_ROLE_KEY`
3. **Value**: Supabase Dashboard'dan kopyaladığın service_role key
4. **Environment**: Production, Preview, Development (hepsini seç)
5. **Save**

### 3. Mevcut Variable'ları Kontrol Et

Şu variable'ların set olduğundan emin ol:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (yeni eklendi)

---

## 📋 ADIM 4: Local Development (.env)

Local development için `.env` dosyasına ekle:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Not:** Service role key'i Supabase Dashboard → Settings → API → service_role key'den al.

---

## 📋 ADIM 5: Vercel'de Redeploy

1. **Vercel Dashboard** → **Deployments**
2. En üstteki deployment'ın yanındaki **⋯** → **Redeploy**
3. **⚠️ ÖNEMLİ:** **Use existing Build Cache** işaretini KALDIR
4. **Redeploy** butonuna tıkla

---

## ✅ Test

### 1. Admin Panel'den Resim Yükle

1. **Admin Panel** → **Vehicles** → **Add Vehicle**
2. Resim seç ve yükle
3. Resim Supabase Storage'a yüklenecek

### 2. Supabase Storage Kontrolü

1. **Supabase Dashboard** → **Storage** → **vehicle-images** bucket
2. Yüklenen resimleri görebilirsin

---

## 🔍 Sorun Giderme

### Hata: "Supabase client not initialized"

**Çözüm:** Environment variable'ları kontrol et:
- `NEXT_PUBLIC_SUPABASE_URL` set mi?
- `SUPABASE_SERVICE_ROLE_KEY` set mi?

### Hata: "Bucket not found"

**Çözüm:** Supabase Dashboard'da `vehicle-images` bucket'ının oluşturulduğundan emin ol.

### Hata: "Permission denied"

**Çözüm:** 
1. Bucket'ın **Public** olduğundan emin ol
2. Storage policies'i kontrol et

---

## 📊 Storage Kullanımı

- **Bucket name**: `vehicle-images`
- **Folder structure**: `vehicles/{timestamp}-{random}.{ext}`
- **Public access**: ✅ Açık
- **Max file size**: 5MB
- **Allowed types**: jpeg, jpg, png, gif, webp

---

## 🎯 Özet

1. ✅ Supabase Storage'da `vehicle-images` bucket oluştur
2. ✅ Service role key'i al
3. ✅ Vercel'de `SUPABASE_SERVICE_ROLE_KEY` environment variable'ı ekle
4. ✅ Local `.env` dosyasına ekle
5. ✅ Vercel'de redeploy et (clear cache ile)
6. ✅ Test et

---

**Not:** Artık resimler Supabase Storage'da saklanacak ve Vercel'de çalışacak! 🎉

