import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Supabase Database Configuration
// Proje ID: rxbtkjihvqjmamdwmsev
// NOT: Local database KULLANILMIYOR - Sadece Supabase kullanılıyor!
// Production: Vercel environment variables kullanılır
// Development: Default değerler (Supabase)

// Veritabanı şifresi zorunlu olmalı
// Vercel serverless environment'ta environment variables yüklenene kadar bekle
if (!process.env.DB_PASSWORD && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  DB_PASSWORD environment variable eksik - veritabanı bağlantısı başarısız olabilir');
  console.warn('⚠️  Vercel Dashboard\'dan DB_PASSWORD ekleyin: https://vercel.com/orhanozan33/kayotomotiv/settings/environment-variables');
  // Throw etme, sadece uyar - bağlantı denemesi sırasında hata alınacak
}

// Connection pool configuration
const poolConfig = {
  // Supabase Database Connection
  // Production: Vercel environment variables kullanılır
  // Development: Default değerler (Supabase)
  host: process.env.DB_HOST || 'db.rxbtkjihvqjmamdwmsev.supabase.co',
  port: parseInt(process.env.DB_PORT) || 6543, // Session Pooler port (IPv4 için)
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'orhanozan33'),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // Artırıldı (15 saniye)
  // Supabase SSL gerektirir (hem production hem development'ta aktif)
  // Supabase cloud database olduğu için SSL her zaman gereklidir
  ssl: {
    rejectUnauthorized: false
  },
};

// Debug: Connection config'i logla (password hariç)
console.log('🔍 Database Connection Config:', {
  host: poolConfig.host,
  port: poolConfig.port,
  database: poolConfig.database,
  user: poolConfig.user,
  password: poolConfig.password ? '[SET]' : '[NOT SET]',
  ssl: poolConfig.ssl ? 'Enabled' : 'Disabled',
  connectionTimeout: poolConfig.connectionTimeoutMillis + 'ms'
});

const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
  console.log('✅ DB_HOST:', process.env.DB_HOST || 'db.rxbtkjihvqjmamdwmsev.supabase.co (default)');
  console.log('✅ DB_PORT:', process.env.DB_PORT || '6543 (default - Session Pooler)');
  console.log('✅ DB_NAME:', process.env.DB_NAME || 'postgres (default)');
  console.log('✅ DB_USER:', process.env.DB_USER || 'postgres (default)');
  console.log('✅ Supabase Proje ID: rxbtkjihvqjmamdwmsev');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  console.error('❌ Error code:', err.code);
  console.error('❌ Error message:', err.message);
  console.error('❌ Environment check:', {
    DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
    DB_PORT: process.env.DB_PORT ? 'SET' : 'NOT SET',
    DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET',
    DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET',
    DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT SET'
  });
  // Vercel serverless'ta process.exit() kullanma - function crash olur
  // Sadece logla, bağlantı yeniden denenecek
});

export default pool;
