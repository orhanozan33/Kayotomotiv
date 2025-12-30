# Vercel Custom Domain Ekleme - kayauto.com

## 📋 Adım Adım: Custom Domain Ekleme

### ADIM 1: Vercel Dashboard'a Gidin

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv/settings/domains
   ```

2. **"Add Domain"** butonuna tıklayın

---

### ADIM 2: Domain Ekleyin

1. **Domain adını girin:**
   ```
   kayauto.com
   ```

2. **"Add"** butonuna tıklayın

3. Vercel size DNS kayıtlarını gösterecek

---

### ADIM 3: DNS Ayarları

Vercel size şu DNS kayıtlarını verecek:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

### ADIM 4: Domain Sağlayıcınızda DNS Ayarları

1. Domain sağlayıcınızın DNS ayarlarına gidin (örn: GoDaddy, Namecheap, vb.)

2. Şu kayıtları ekleyin:
   - **A Record:** `@` → `76.76.21.21`
   - **CNAME Record:** `www` → `cname.vercel-dns.com`

3. Kaydet ve bekleyin (5-60 dakika)

---

### ADIM 5: SSL Sertifikası

Vercel otomatik olarak SSL sertifikası ekleyecek (Let's Encrypt)

---

## ✅ Sonuç

Domain eklendikten sonra:

- **Ana Site:** `https://kayauto.com`
- **Admin Panel:** `https://kayauto.com/admin`
- **Backend API:** `https://kayauto.com/api`

---

## 🧪 Test

1. **Ana Site:**
   ```
   https://kayauto.com
   ```

2. **Admin Panel:**
   ```
   https://kayauto.com/admin
   ```

3. **Backend API:**
   ```
   https://kayauto.com/api
   ```

---

**Domain eklendikten sonra tüm URL'ler çalışacak!** 🚀

