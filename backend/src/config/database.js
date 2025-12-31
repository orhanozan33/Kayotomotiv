import pg from 'pg';

const { Pool } = pg;

// Supabase Database Configuration
// Proje ID: rxbtkjihvqjmamdwmsev
// NOT: Environment variables KULLANILMIYOR - Direkt Supabase bağlantısı!
// NOT: Local database KULLANILMIYOR - Sadece Supabase kullanılıyor!

// Direkt Supabase Bağlantı Bilgileri (Environment variables kullanılmıyor)
const SUPABASE_CONFIG = {
  host: 'db.rxbtkjihvqjmamdwmsev.supabase.co',
  port: 5432, // Direct Connection (5432) - Session Pooler (6543) alternatif
  database: 'postgres',
  user: 'postgres',
  password: 'orhanozan33',
};

// Connection pool configuration
const poolConfig = {
  // Direkt Supabase Database Connection
  // Environment variables kullanılmıyor - direkt bağlantı
  host: SUPABASE_CONFIG.host,
  port: SUPABASE_CONFIG.port,
  database: SUPABASE_CONFIG.database,
  user: SUPABASE_CONFIG.user,
  password: SUPABASE_CONFIG.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // 15 saniye
  // Supabase SSL gerektirir (hem production hem development'ta aktif)
  // Supabase cloud database olduğu için SSL her zaman gereklidir
  ssl: {
    rejectUnauthorized: false
  },
};

// Debug: Connection config'i logla (password hariç)
console.log('🔍 Database Connection Config (Direkt Supabase):', {
  host: poolConfig.host,
  port: poolConfig.port,
  database: poolConfig.database,
  user: poolConfig.user,
  password: '[SET - Direkt Bağlantı]',
  ssl: poolConfig.ssl ? 'Enabled' : 'Disabled',
  connectionTimeout: poolConfig.connectionTimeoutMillis + 'ms',
  supabaseProjectId: 'rxbtkjihvqjmamdwmsev'
});

const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully (Direkt Supabase)');
  console.log('✅ DB_HOST:', SUPABASE_CONFIG.host);
  console.log('✅ DB_PORT:', SUPABASE_CONFIG.port);
  console.log('✅ DB_NAME:', SUPABASE_CONFIG.database);
  console.log('✅ DB_USER:', SUPABASE_CONFIG.user);
  console.log('✅ Supabase Proje ID: rxbtkjihvqjmamdwmsev');
  console.log('✅ Bağlantı Tipi: Direkt (Environment variables kullanılmıyor)');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  console.error('❌ Error code:', err.code);
  console.error('❌ Error message:', err.message);
  console.error('❌ Supabase Connection Config:', {
    host: SUPABASE_CONFIG.host,
    port: SUPABASE_CONFIG.port,
    database: SUPABASE_CONFIG.database,
    user: SUPABASE_CONFIG.user,
    password: '[SET - Direkt Bağlantı]'
  });
  // Vercel serverless'ta process.exit() kullanma - function crash olur
  // Sadece logla, bağlantı yeniden denenecek
});

export default pool;
