// Supabase Direct Connection Test
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connection details MUST come from environment variables (.env / Vercel)
const missing = [];
const host = process.env.DB_HOST;
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
const database = process.env.DB_NAME;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

if (!host) missing.push('DB_HOST');
if (!port || Number.isNaN(port)) missing.push('DB_PORT');
if (!database) missing.push('DB_NAME');
if (!user) missing.push('DB_USER');
if (!password) missing.push('DB_PASSWORD');

if (missing.length > 0) {
  console.error('❌ Eksik environment variable(lar):', missing.join(', '));
  console.error('👉 Lütfen .env (veya Vercel env) içine DB_* bilgilerini ekleyin.');
  process.exit(1);
}

const sslEnabled = process.env.DB_SSL === undefined ? true : ['true', '1', 'yes'].includes(String(process.env.DB_SSL).toLowerCase());

const config = {
  host,
  port,
  database,
  user,
  password,
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
};

console.log('========================================');
console.log('SUPABASE BAGLANTI TESTI');
console.log('========================================');
console.log('');
console.log('Baglanti Bilgileri:');
console.log('  Host:', config.host);
console.log('  Port:', config.port);
console.log('  Database:', config.database);
console.log('  User:', config.user);
console.log('  Password:', config.password ? '[SET]' : '[NOT SET]');
console.log('  SSL:', config.ssl ? 'Enabled' : 'Disabled');
console.log('');

const pool = new Pool(config);

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully!');
  console.log('✅ Supabase baglantisi basarili!');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
  console.error('❌ Error code:', err.code);
});

// Test query
async function testConnection() {
  let client;
  try {
    console.log('🔄 Baglanti deneniyor...');
    client = await pool.connect();
    console.log('✅ Baglanti basarili!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query basarili!');
    console.log('  Current Time:', result.rows[0].current_time);
    console.log('  PostgreSQL Version:', result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1]);
    
    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('');
    console.log('📋 Mevcut Tablolar:');
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.table_name}`);
      });
    } else {
      console.log('  ⚠️  Henuz tablo yok (SQL script calistirilmali)');
    }
    
    console.log('');
    console.log('========================================');
    console.log('SONUC: BAGLANTI BASARILI! ✅');
    console.log('========================================');
    
  } catch (error) {
    console.error('');
    console.error('❌ Baglanti hatasi:');
    console.error('  Error:', error.message);
    console.error('  Code:', error.code);
    console.error('');
    
    if (error.code === '28P01') {
      console.error('⚠️  Authentication failed - Sifre yanlis olabilir');
      console.error('⚠️  DB_PASSWORD değerini kontrol edin');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error('⚠️  Connection refused - Host veya port yanlis olabilir');
      console.error('⚠️  Kontrol edin:');
      console.error(`    - Host: ${host}`);
      console.error(`    - Port: ${port}`);
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⚠️  Connection timeout - Network sorunu olabilir');
    }
    
    console.error('');
    console.error('========================================');
    console.error('SONUC: BAGLANTI BASARISIZ! ❌');
    console.error('========================================');
    
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run test
testConnection().catch(console.error);

