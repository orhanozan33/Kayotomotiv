# 🔑 Vercel API Token - Tam Yetki Verme Rehberi

## 📋 Adım Adım: Tam Yetkili API Token Oluşturma

### ADIM 1: Vercel Dashboard'a Giriş

1. **Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```

2. **Giriş yapın** (eğer giriş yapmadıysanız)

---

### ADIM 2: Settings → Tokens Sayfasına Gidin

1. **Sağ üst köşedeki profil ikonuna** tıklayın
2. **"Settings"** seçeneğine tıklayın
3. Sol menüden **"Tokens"** seçeneğine tıklayın

   veya direkt link:
   ```
   https://vercel.com/account/tokens
   ```

---

### ADIM 3: Yeni Token Oluştur

1. **"Create Token"** butonuna tıklayın

2. **Token Ayarları:**
   - **Name:** `Kayoto Full Access` (veya istediğiniz bir isim)
   - **Expiration:** 
     - ✅ **"No expiration"** seçin (süresiz)
     - veya belirli bir süre seçin (örn: 1 yıl)

3. **"Create Token"** butonuna tıklayın

4. ⚠️ **ÖNEMLİ:** Token'ı kopyalayın ve güvenli bir yere kaydedin
   - Token sadece bir kez gösterilir!
   - Kaybetmemeniz gerekiyor

---

### ADIM 4: Token Yetkilerini Kontrol Et

Vercel'de token'lar varsayılan olarak **tam yetkiye** sahiptir. Ancak kontrol etmek için:

1. **Token'ı oluşturduktan sonra**, token listesinde görünecek
2. Token'ın yanında **"..." (üç nokta)** → **"View"** tıklayın
3. **"Scopes"** bölümünde şunlar olmalı:
   - ✅ `read:project`
   - ✅ `write:project`
   - ✅ `read:deployment`
   - ✅ `write:deployment`
   - ✅ `read:environment-variable`
   - ✅ `write:environment-variable`
   - ✅ `read:team`
   - ✅ `write:team`

---

### ADIM 5: Token'ı Script'e Ekleyin

Yeni token'ı aldıktan sonra:

1. **Token'ı kopyalayın**

2. **Script'i güncelleyin:**
   ```powershell
   # vercel-otomatik-ayarla.ps1 dosyasında
   $VercelToken = "YENİ_TOKEN_BURAYA"
   ```

3. **Script'i çalıştırın:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File "vercel-otomatik-ayarla.ps1"
   ```

---

## 🔒 Güvenlik Notları

1. **Token'ı asla paylaşmayın**
   - GitHub'a commit etmeyin
   - Public repository'lere eklemeyin
   - `.gitignore` dosyasına ekleyin

2. **Token'ı sadece güvenli yerlerde saklayın**
   - Environment variable olarak
   - Güvenli bir password manager'da
   - Local bir dosyada (gitignore'da)

3. **Eski token'ları iptal edin**
   - Artık kullanmadığınız token'ları silin
   - Token listesinden **"Delete"** ile silebilirsiniz

---

## ✅ Token Oluşturulduktan Sonra

1. ✅ Yeni token'ı script'e ekleyin
2. ✅ Script'i çalıştırın
3. ✅ Environment variables otomatik eklenecek
4. ✅ Build ayarları otomatik güncellenecek

---

## 🚀 Hızlı Başlangıç

1. **Token Oluştur:**
   ```
   https://vercel.com/account/tokens
   → Create Token
   → Name: Kayoto Full Access
   → No expiration
   → Create Token
   → Token'ı kopyala
   ```

2. **Script'e Ekle:**
   ```powershell
   # vercel-otomatik-ayarla.ps1
   $VercelToken = "YENİ_TOKEN_BURAYA"
   ```

3. **Çalıştır:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File "vercel-otomatik-ayarla.ps1"
   ```

---

**Token oluşturduktan sonra bana yeni token'ı verin, script'i güncelleyip çalıştırayım!** 🚀

