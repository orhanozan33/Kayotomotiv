# 🚀 HIZLI SEÇİM - Git mi Klasör Yolu mu?

## ⚡ Hızlı Karar

### Git Repository'niz VAR mı?
- ✅ **EVET** → Git'ten alın (ÖNERİLEN)
- ❌ **HAYIR** → Klasör yolundan alın (Hızlı test)

---

## 📋 YÖNTEM 1: Git Repository'den (ÖNERİLEN ✅)

### Avantajları:
- ✅ Otomatik deployment
- ✅ Her commit'te otomatik deploy
- ✅ Git geçmişi korunur
- ✅ Team collaboration

### Adımlar:

1. **Git repository hazırla:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File "git-kurulum.ps1"
   ```

2. **Vercel Dashboard'dan import:**
   ```
   https://vercel.com/new
   ```
   - Repository'nizi seçin
   - Project Name: `kayoto`
   - Deploy edin

---

## 📋 YÖNTEM 2: Klasör Yolundan (Hızlı Test)

### Avantajları:
- ✅ Hızlı kurulum
- ✅ Git repository gerekmez
- ✅ Hemen test edilebilir

### Adımlar:

1. **Hızlı deploy:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File "hizli-vercel-deploy.ps1"
   ```

2. **Environment variables ekle:**
   - Vercel Dashboard → Settings → Environment Variables

---

## 🎯 ÖNERİ

**Git Repository'den alın** çünkü:
- Otomatik deployment
- Daha profesyonel
- Gelecekte daha kolay yönetim

**Ama hızlı test için:**
- Klasör yolundan alın

---

## 🚀 Hızlı Başlangıç

**Git Repository yoksa:**
```powershell
powershell -ExecutionPolicy Bypass -File "hizli-vercel-deploy.ps1"
```

**Git Repository varsa:**
```powershell
powershell -ExecutionPolicy Bypass -File "git-kurulum.ps1"
# Sonra Vercel Dashboard'dan import edin
```

---

**Hangi yöntemi kullanmak istiyorsunuz?** 🚀

