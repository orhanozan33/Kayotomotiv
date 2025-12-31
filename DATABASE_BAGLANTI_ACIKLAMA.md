# 🔌 Database Bağlantısı Açıklaması

## 📚 Kullanılan Kütüphane

**`pg` (node-postgres)** - PostgreSQL için Node.js kütüphanesi

**Package:** `pg@^8.11.3`

---

## 🔧 Bağlantı Yapılandırması

### Dosya: `backend/src/config/database.js`

```javascript
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connection Pool oluştur
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ototamir',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,                          // Maksimum bağlantı sayısı
  idleTimeoutMillis: 30000,         // Boşta kalma süresi (30 saniye)
  connectionTimeoutMillis: 10000,    // Bağlantı timeout (10 saniye)
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false        // Supabase SSL için
  } : false,
});
```

---

## 🌐 Supabase Bağlantısı

### Environment Variables (Vercel):

```
DB_HOST=db.rxbtkjihvqjmamdwmsev.supabase.co
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=orhanozan33
```

### Connection String Formatı:

```
postgresql://postgres:orhanozan33@db.rxbtkjihvqjmamdwmsev.supabase.co:6543/postgres
```

---

## 🔄 Connection Pool Nedir?

**Connection Pool:** Veritabanı bağlantılarını yöneten bir sistem.

**Avantajları:**
- ✅ Bağlantıları yeniden kullanır (hızlı)
- ✅ Maksimum bağlantı sayısını kontrol eder
- ✅ Boşta kalan bağlantıları kapatır
- ✅ Serverless environment için uygun

**Kullanım:**
```javascript
// Query çalıştırma
const result = await pool.query('SELECT * FROM vehicles');

// Client alma (transaction için)
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // ... işlemler
  await client.query('COMMIT');
} finally {
  client.release();
}
```

---

## 🔐 SSL Bağlantısı

**Supabase SSL gerektirir:**

```javascript
ssl: process.env.NODE_ENV === 'production' ? {
  rejectUnauthorized: false  // Supabase için gerekli
} : false
```

**Neden `rejectUnauthorized: false`?**
- Supabase'in SSL sertifikası otomatik olarak doğrulanır
- Self-signed certificate kullanmıyor
- Güvenli bağlantı sağlar

---

## 📊 Bağlantı Ayarları

### `max: 20`
- Maksimum 20 eşzamanlı bağlantı
- Vercel serverless için yeterli

### `idleTimeoutMillis: 30000`
- 30 saniye boşta kalan bağlantılar kapatılır
- Kaynak tasarrufu sağlar

### `connectionTimeoutMillis: 10000`
- 10 saniye içinde bağlantı kurulamazsa timeout
- Hızlı hata mesajı verir

---

## 🧪 Bağlantı Testi

### Event Listeners:

```javascript
// Başarılı bağlantı
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

// Bağlantı hatası
pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});
```

---

## 📋 Kullanım Örnekleri

### 1. Basit Query:

```javascript
import pool from '../config/database.js';

const result = await pool.query('SELECT * FROM vehicles');
console.log(result.rows);
```

### 2. Parametreli Query (SQL Injection Korumalı):

```javascript
const result = await pool.query(
  'SELECT * FROM vehicles WHERE brand = $1',
  ['Toyota']
);
```

### 3. Transaction:

```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO vehicles ...');
  await client.query('INSERT INTO vehicle_images ...');
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

---

## 🔍 Hata Durumları

### 1. Connection Failed:
```
getaddrinfo ENOTFOUND db.rxbtkjihvqjmamdwmsev.supabase.co
```
**Çözüm:** DB_HOST kontrol et

### 2. Authentication Failed:
```
password authentication failed
```
**Çözüm:** DB_PASSWORD kontrol et

### 3. SSL Required:
```
SSL connection required
```
**Çözüm:** SSL ayarlarını kontrol et

---

## ✅ Özet

- **Kütüphane:** `pg` (node-postgres)
- **Yöntem:** Connection Pool
- **SSL:** Production'da aktif
- **Host:** Supabase (db.rxbtkjihvqjmamdwmsev.supabase.co)
- **Port:** 6543 (Session Pooler)
- **Database:** postgres
- **User:** postgres
- **Password:** Environment variable'dan alınıyor

---

**Database bağlantısı `pg` kütüphanesi ile Connection Pool kullanarak yapılıyor!** 🔌

