# Vercel Proje Oluşturma - Git vs Klasör Yolu

## 🎯 İki Yöntem

### Yöntem 1: Git Repository'den (ÖNERİLEN ✅)

**Avantajları:**
- ✅ Otomatik deployment (her commit'te)
- ✅ Git geçmişi korunur
- ✅ Kolay rollback
- ✅ Team collaboration

**Dezavantajları:**
- ⚠️ Git repository gerekli
- ⚠️ İlk kurulum biraz daha uzun

---

### Yöntem 2: Klasör Yolundan (Hızlı Test)

**Avantajları:**
- ✅ Hızlı kurulum
- ✅ Git repository gerekmez
- ✅ Hemen test edilebilir

**Dezavantajları:**
- ⚠️ Manuel deployment gerekir
- ⚠️ Git geçmişi yok
- ⚠️ Team collaboration zor

---

## 📋 YÖNTEM 1: Git Repository'den (ÖNERİLEN)

### ADIM 1: Git Repository Hazırla

1. **GitHub/GitLab/Bitbucket'te repository oluşturun:**
   ```
   https://github.com/new
   ```

2. **Repository adı:** `kayoto` (veya istediğiniz isim)

3. **Local repository'yi Git'e bağlayın:**
   ```powershell
   cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"
   
   # Git repository başlat (eğer yoksa)
   git init
   git add .
   git commit -m "Initial commit - Kayoto monorepo"
   
   # Remote repository ekle
   git remote add origin https://github.com/KULLANICI_ADI/kayoto.git
   git branch -M main
   git push -u origin main
   ```

---

### ADIM 2: Vercel'de Git'ten Import Et

1. **Vercel Dashboard:**
   ```
   https://vercel.com/new
   ```

2. **Import Git Repository:**
   - GitHub/GitLab/Bitbucket hesabınızı bağlayın
   - `kayoto` repository'sini seçin
   - "Import" butonuna tıklayın

3. **Proje Ayarları:**
   - Project Name: `kayoto`
   - Framework Preset: `Other`
   - Root Directory: `.` (root)
   - Build Command: (boş bırakın, Vercel otomatik algılayacak)
   - Output Directory: `.`
   - Install Command: (boş bırakın)

4. **Environment Variables:**
   - Şimdi ekleyin veya sonra Settings'ten ekleyin

5. **Deploy** butonuna tıklayın

---

## 📋 YÖNTEM 2: Klasör Yolundan (Hızlı Test)

### ADIM 1: Vercel CLI ile Deploy

```powershell
cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"
vercel --prod --token vck_30SelLzv3008tnFQOvl1PUxTqyqo3JPu4dtmBHAlz112qZpvKj0soi37
```

**Sorular:**
- Set up and deploy? → `Y`
- Which scope? → Hesabınızı seçin
- Link to existing project? → `N` (yeni proje)
- What's your project's name? → `kayoto`
- In which directory is your code located? → `./` (mevcut klasör)
- Want to override the settings? → `N` (varsayılan ayarları kullan)

---

### ADIM 2: Environment Variables Ekle

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33-1123s-projects/kayoto/settings/environment-variables
   ```

2. **Şu değişkenleri ekleyin:**
   ```
   DB_HOST=db.xlioxvlohlgpswhpjawa.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=orhanozan33
   JWT_SECRET=ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b
   BACKEND_PASSWORD_HASH=$2a$10$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m
   FRONTEND_URL=https://kayoto.vercel.app
   ```

---

## 🎯 Hangi Yöntemi Seçmeliyim?

### Git Repository'den Seçin Eğer:
- ✅ Git repository'niz varsa
- ✅ Otomatik deployment istiyorsanız
- ✅ Team ile çalışıyorsanız
- ✅ Production için hazırsanız

### Klasör Yolundan Seçin Eğer:
- ✅ Hızlı test etmek istiyorsanız
- ✅ Git repository yoksa
- ✅ Tek seferlik deployment yeterliyse

---

## 💡 ÖNERİ

**Git Repository'den alın** çünkü:
1. Otomatik deployment yapılır
2. Her değişiklikte otomatik deploy olur
3. Daha profesyonel bir yaklaşım
4. Gelecekte daha kolay yönetim

---

## 🚀 Hızlı Başlangıç

**Git Repository yoksa:**
```powershell
cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"
vercel --prod --token vck_30SelLzv3008tnFQOvl1PUxTqyqo3JPu4dtmBHAlz112qZpvKj0soi37
```

**Git Repository varsa:**
1. Repository'yi GitHub'a push edin
2. Vercel Dashboard'dan import edin

---

**Hangi yöntemi kullanmak istiyorsunuz?** 🚀

