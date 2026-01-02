# 🔑 Supabase Service Role Key Bulma Rehberi

## 📍 Service Role Key Nerede?

Service role key'i **Settings → API** sayfasında bulabilirsin.

---

## 📋 ADIM ADIM: Service Role Key Bulma

### ADIM 1: Supabase Dashboard'a Git

1. **Supabase Dashboard**: https://supabase.com/dashboard
2. Projeni seç: `kayotomotiv` (veya proje adın)

### ADIM 2: Settings → API Sayfasına Git

1. Sol menüden **Settings** (⚙️) seç
2. **Settings** altında **API** seçeneğine tıkla
   - Eğer göremiyorsan, **Settings** menüsünü genişlet

### ADIM 3: Service Role Key'i Bul

**API Keys** bölümünde 2 tane key göreceksin:

1. **anon** `public` key (Publishable key)
   - Bu: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` olarak kullanılıyor
   - Zaten Vercel'de var

2. **service_role** `secret` key ⚠️
   - Bu: `SUPABASE_SERVICE_ROLE_KEY` olarak kullanılacak
   - **⚠️ GİZLİ TUT!** Bu key tüm database ve storage'a tam erişim sağlar

### ADIM 4: Service Role Key'i Kopyala

1. **service_role** key'in yanındaki **👁️ (eye icon)** veya **Copy** butonuna tıkla
2. Key'i kopyala
3. **⚠️ ÖNEMLİ:** Bu key'i kimseyle paylaşma!

---

## 🔍 Alternatif Yol: URL ile Direkt Git

Eğer menüden bulamazsan, direkt URL'ye git:

```
https://supabase.com/dashboard/project/daruylcofjhrvjhilsuf/settings/api
```

**Not:** `daruylcofjhrvjhilsuf` yerine kendi project reference'ını kullan.

---

## 📊 Service Role Key Görünümü

Service Role Key şuna benzer:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhcnV5bGNvZmpoaHJ2amhpbHN1ZiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MzU4NDU2MDAsImV4cCI6MjA1MTQyMTYwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Özellikler:**
- Çok uzun bir string (200+ karakter)
- `service_role` kelimesi içerir
- **secret** olarak işaretlenmiş

---

## ✅ Kontrol Listesi

- [ ] Supabase Dashboard'a gittim
- [ ] Settings → API sayfasına gittim
- [ ] **service_role** key'i buldum
- [ ] Key'i kopyaladım
- [ ] Vercel'de `SUPABASE_SERVICE_ROLE_KEY` environment variable'ına ekledim
- [ ] Local `.env` dosyasına ekledim

---

## 🚨 Önemli Notlar

1. **Service Role Key Gizli Tutulmalı:**
   - Bu key tüm database ve storage'a tam erişim sağlar
   - Sadece server-side kodda kullanılmalı
   - Client-side kodda ASLA kullanılmamalı

2. **anon key vs service_role key:**
   - **anon key**: Client-side işlemler için (zaten var)
   - **service_role key**: Server-side işlemler için (yeni eklenecek)

3. **Eğer Key'i Göremiyorsan:**
   - Sayfayı yenile (F5)
   - Farklı bir tarayıcı dene
   - Supabase hesabının admin yetkisi olduğundan emin ol

---

## 📝 Sonraki Adımlar

Service role key'i bulduktan sonra:

1. **Vercel'de Environment Variable Ekle:**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Kopyaladığın service_role key
   - Environment: Production, Preview, Development

2. **Local .env Dosyasına Ekle:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Vercel'de Redeploy Et:**
   - Clear cache ile redeploy

---

**Not:** Eğer hala bulamazsan, Supabase support'a ulaş veya proje owner'ından yardım iste.

