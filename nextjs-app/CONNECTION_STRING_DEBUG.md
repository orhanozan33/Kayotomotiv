# 🔍 Connection String Debug Rehberi

## ❌ Sorun

```
{"error":"Database connection failed","message":"Unable to connect to database."}
```

Bu hata, connection string'in doğru olmadığı veya bağlantı parametrelerinde bir sorun olduğu anlamına geliyor.

## 🔍 Debug Adımları

### ADIM 1: Vercel Functions Logs Kontrolü

1. **Vercel Dashboard** → **Functions** → **Logs** sekmesine git
2. En son log'ları görüntüle
3. Şu mesajları ara:
   - `🔍 Database Connection Config:`
   - `🔍 Environment check:`
   - `❌ Database initialization error:`
   - `❌ GET /api/vehicles - Error:`

4. **Son 50-100 satırı kopyala** ve paylaş

### ADIM 2: Connection String Format Kontrolü

**Doğru Format:**
```
postgresql://postgres.daruylcofjhrvjhilsuf:ŞİFRE@aws-1-ca-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

**Kontrol Listesi:**
- ✅ Protocol: `postgresql://` (veya `postgres://`)
- ✅ Username: `postgres.daruylcofjhrvjhilsuf` (nokta ile)
- ✅ Password: Supabase Dashboard'dan aldığın password
- ✅ Host: `aws-1-ca-central-1.pooler.supabase.com` (region doğru mu?)
- ✅ Port: `6543` (pgBouncer portu)
- ✅ Database: `postgres`
- ✅ Parameters: `?pgbouncer=true&connection_limit=1&sslmode=require`

### ADIM 3: Vercel Environment Variables Kontrolü

1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. **DATABASE_URL** değişkenini bul
3. **Value** alanını kontrol et:
   - Whitespace var mı? (başta/sonda boşluk)
   - Özel karakterler doğru mu?
   - Password doğru mu?

4. **Connection string'i kopyala** ve kontrol et:
   - Supabase Dashboard'dan aldığın ile aynı mı?
   - Password doğru mu?

### ADIM 4: Supabase Connection String Test

1. **Supabase Dashboard** → **SQL Editor**
2. Connection string'i test et:
   - Supabase Dashboard'dan aldığın connection string'i kopyala
   - Password'ü ekle
   - Local'de test et (opsiyonel)

### ADIM 5: Password Kontrolü

1. **Supabase Dashboard** → **Settings** → **Database**
2. **Database password** bölümüne git
3. Password'ü kontrol et veya reset et
4. Yeni password'ü not al
5. Vercel'de DATABASE_URL'i güncelle

## 🔧 Çözüm Adımları

### Çözüm 1: Connection String'i Yeniden Oluştur

1. **Supabase Dashboard** → **Settings** → **Database**
2. **Connection string** bölümüne git
3. **Shared Pooler** seçeneğini seç
4. **URI** formatını seç
5. Connection string'i kopyala
6. Password'ü ekle
7. Sonuna parametreleri ekle: `?pgbouncer=true&connection_limit=1&sslmode=require`

**Örnek:**
```
postgresql://postgres.daruylcofjhrvjhilsuf:orhanozan33@aws-1-ca-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

### Çözüm 2: Password'de Özel Karakterler Varsa

Eğer password'de özel karakterler varsa, URL encode et:

| Karakter | Encoded |
|----------|---------|
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| `&` | `%26` |
| `#` | `%23` |
| `%` | `%25` |
| `+` | `%2B` |
| `=` | `%3D` |

**Örnek:**
- Password: `pass@word:123`
- Encoded: `pass%40word%3A123`

### Çözüm 3: Region Kontrolü

Supabase Dashboard'da gösterilen region'u kontrol et:
- `aws-1-ca-central-1` (Kanada)
- `aws-1-us-east-1` (ABD Doğu)
- veya başka bir region

**Eğer region farklıysa:**
- Supabase Dashboard'dan gösterilen region'u kullan
- Connection string'deki region'u değiştir

### Çözüm 4: Whitespace Temizle

Connection string'de başta/sonda whitespace olmamalı:

**Yanlış:**
```
 postgresql://...
```
```
postgresql://... 
```

**Doğru:**
```
postgresql://...
```

## 📊 Paylaşılması Gereken Bilgiler

1. **Vercel Functions Logs** (son 50-100 satır):
   - `🔍 Database Connection Config:` mesajı
   - `❌ Database initialization error:` mesajı
   - Tam hata mesajı

2. **Vercel Environment Variables:**
   - DATABASE_URL'in ilk 50 karakteri (password hariç):
     ```
     postgresql://postgres.daruylcofjhrvjhilsuf:***@aws-1-ca-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
     ```

3. **Supabase Connection String:**
   - Supabase Dashboard'dan gösterilen connection string (password hariç)
   - Region bilgisi

---

**Not:** Vercel Functions Logs'dan tam hata mesajını paylaş, birlikte çözelim!

