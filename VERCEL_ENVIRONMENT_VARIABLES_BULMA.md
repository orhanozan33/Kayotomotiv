# 🔍 Vercel Environment Variables Bulma

## ⚠️ Önemli: Vercel'de Database Ekranı Yok!

Vercel'de ayrı bir "database ekranı" yok. Database ayarları **Environment Variables** sayfasında yapılır.

---

## 📋 Adım Adım: Environment Variables Sayfasına Git

### 1️⃣ Vercel Dashboard'a Git

**Direkt link:**
```
https://vercel.com/orhanozan33/kayotomotiv
```

---

### 2️⃣ Settings Sekmesine Tıkla

1. Proje sayfasında üst menüden **"Settings"** sekmesine tıklayın
2. Veya direkt link:
   ```
   https://vercel.com/orhanozan33/kayotomotiv/settings
   ```

---

### 3️⃣ Environment Variables'a Git

1. Sol menüden **"Environment Variables"** seçeneğine tıklayın
2. Veya direkt link:
   ```
   https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
   ```

---

## 🎯 Environment Variables Sayfası

Bu sayfada şunları göreceksiniz:

- **Mevcut environment variables listesi**
- **"Add New" butonu** (sağ üstte)
- Her variable için:
  - Key (isim)
  - Value (değer - gizli)
  - Environment (Production, Preview, Development)
  - Actions (düzenle/sil)

---

## 📋 Database Variables Kontrol

Bu sayfada şu database variables'ları görmelisiniz:

- ✅ `DB_HOST`
- ✅ `DB_PORT`
- ✅ `DB_NAME`
- ✅ `DB_USER`
- ✅ `DB_PASSWORD` (eğer eklendiyse)
- ✅ `JWT_SECRET`

---

## ➕ Yeni Variable Ekleme

1. **"Add New" butonuna tıklayın** (sağ üstte)

2. **Form doldurun:**
   - **Key:** Variable ismi (örn: `DB_PASSWORD`)
   - **Value:** Variable değeri (örn: `orhanozan33`)
   - **Environment:** Hangi environment'larda kullanılacak
     - ✅ Production
     - ✅ Preview
     - ✅ Development

3. **"Save" butonuna tıklayın**

---

## 🔧 Mevcut Variable Düzenleme

1. **Variable listesinde düzenlemek istediğiniz variable'ı bulun**

2. **Sağ taraftaki "..." (üç nokta) menüsüne tıklayın**

3. **"Edit" seçeneğine tıklayın**

4. **Value'yu güncelleyin**

5. **"Save" butonuna tıklayın**

---

## 🗑️ Variable Silme

1. **Variable listesinde silmek istediğiniz variable'ı bulun**

2. **Sağ taraftaki "..." (üç nokta) menüsüne tıklayın**

3. **"Delete" seçeneğine tıklayın**

4. **Onaylayın**

---

## 📸 Görsel Rehber

**Vercel Dashboard Yapısı:**
```
┌─────────────────────────────────────┐
│  kayotomotiv                    [⚙️]│
├─────────────────────────────────────┤
│  [Overview] [Deployments] [Settings]│
│                                     │
│  Settings Menüsü:                  │
│  - General                          │
│  - Environment Variables  ← BURASI │
│  - Domains                          │
│  - Integrations                     │
│  - ...                              │
└─────────────────────────────────────┘
```

---

## 🔗 Hızlı Linkler

**Environment Variables Sayfası:**
```
https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
```

**Settings Ana Sayfa:**
```
https://vercel.com/orhanozan33/kayotomotiv/settings
```

**Proje Ana Sayfa:**
```
https://vercel.com/orhanozan33/kayotomotiv
```

---

## ✅ Kontrol Listesi

- [ ] Vercel Dashboard'a gidildi
- [ ] Settings sekmesine tıklandı
- [ ] Environment Variables sayfasına gidildi
- [ ] Mevcut variables görüldü
- [ ] DB_PASSWORD eklendi (eğer yoksa)

---

**Environment Variables sayfası database ayarlarınızın yapıldığı yerdir!** 🔐

