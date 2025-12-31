# Supabase Session Pooler Seçimi - Adım Adım

## 🎯 Şu Anda Yapılacaklar

### 1️⃣ Method Dropdown'dan "Session pooler" Seç

Ekranınızda **"Method"** dropdown'u açık ve üç seçenek görüyorsunuz:

1. ❌ **Direct connection** (Şu anda seçili - IPv4 uyumlu değil)
2. ⚠️ **Transaction pooler** (IPv4 için uygun değil)
3. ✅ **Session pooler** (IPv4 uyumlu - BUNU SEÇ!)

**Yapılacak:**
1. **"Session pooler" seçeneğine tıklayın**
2. **"SHARED POOLER" butonuna tıklayın**

---

### 2️⃣ Connection String'i Kopyala

"Session pooler" seçildikten sonra:

1. **Connection string görünecek:**
   ```
   postgresql://postgres:[PASSWORD]@db.rxbtkjihvqjmamdwmsev.supabase.co:6543/postgres?pgbouncer=true
   ```

2. **Password'u kopyalayın:**
   - Connection string'deki `[PASSWORD]` kısmını kopyalayın
   - Veya "Show password" butonuna tıklayarak password'u görebilirsiniz

---

### 3️⃣ Vercel'e DB_PASSWORD Ekle

1. **Vercel Dashboard:**
   ```
   https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables
   ```

2. **"Add New" butonuna tıklayın**

3. **Şunları girin:**
   - Key: `DB_PASSWORD`
   - Value: [Supabase'den kopyaladığınız password]
   - Environment: ✅ Production, ✅ Preview, ✅ Development

4. **"Save" butonuna tıklayın**

---

## ⚠️ Önemli Notlar

- ✅ **Session pooler kullanın** (port 6543) - IPv4 uyumlu
- ❌ **Direct connection kullanmayın** - IPv4 uyumlu değil
- ❌ **Transaction pooler kullanmayın** - IPv4 için uygun değil
- ✅ **SHARED POOLER seçin** (Dedicated Pooler IPv4 uyumlu değil)

---

## 📋 Connection Bilgileri

**Session Pooler (SHARED):**
- Host: `db.rxbtkjihvqjmamdwmsev.supabase.co`
- Port: `6543`
- Database: `postgres`
- User: `postgres`
- Password: [Connection string'den kopyalayın]

---

## ✅ Sonraki Adımlar

1. ✅ Session pooler seçildi
2. ✅ Password kopyalandı
3. ⏳ Vercel'e DB_PASSWORD eklenecek
4. ⏳ Deployment yeniden başlatılacak
5. ⏳ Admin giriş test edilecek

---

**Session pooler'ı seçip password'u kopyaladıktan sonra Vercel'e ekleyin!** 🔐

