# 🔌 Supabase API Bağlantısı Kurulumu

## 📋 Adım 1: Supabase Anon Key Al

**Supabase Dashboard:**
```
https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/settings/api
```

**1. "API Settings" sayfasına git**

**2. "Project API keys" bölümünde:**
   - **`anon` `public`** key'i kopyala
   - Bu key'i `backend/src/config/supabase.js` dosyasına yapıştır

---

## 📋 Adım 2: Supabase Client Yapılandırması

**Dosya:** `backend/src/config/supabase.js`

**Güncelle:**
```javascript
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // Supabase Dashboard'dan al
```

---

## 📋 Adım 3: Database Bağlantısını Güncelle

**İki seçenek var:**

### Seçenek 1: Sadece Supabase API Kullan (Önerilen)
- ✅ Daha güvenli
- ✅ RLS desteği
- ✅ Otomatik connection pooling
- ✅ Rate limiting

### Seçenek 2: Hem PostgreSQL Pool Hem Supabase API
- ✅ Mevcut kod çalışmaya devam eder
- ✅ Yeni özellikler için Supabase API kullanılabilir

---

## 🔧 Mevcut Durum

**Şu anda:**
- ❌ PostgreSQL pool bağlantısı başarısız
- ✅ Supabase API client eklendi
- ⏳ Anon key eklenmesi gerekiyor

---

## ✅ Sonraki Adımlar

1. ✅ Supabase Dashboard'dan anon key al
2. ✅ `backend/src/config/supabase.js` dosyasına ekle
3. ✅ Backend'i test et
4. ✅ Vercel'e deploy et

---

## 🚀 Hızlı Başlangıç

**Supabase Dashboard:**
```
https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/settings/api
```

**Anon key'i kopyala ve `backend/src/config/supabase.js` dosyasına yapıştır!**

