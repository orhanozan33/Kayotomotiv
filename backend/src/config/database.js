import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Veritabanı şifresi zorunlu olmalı
// Vercel serverless environment'ta environment variables yüklenene kadar bekle
if (!process.env.DB_PASSWORD && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  DB_PASSWORD environment variable eksik - veritabanı bağlantısı başarısız olabilir');
  // Throw etme, sadece uyar - bağlantı denemesi sırasında hata alınacak
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ototamir',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : '333333'),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // Supabase SSL gerektirir
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  // Vercel serverless'ta process.exit() kullanma - function crash olur
  // Sadece logla, bağlantı yeniden denenecek
});

export default pool;

