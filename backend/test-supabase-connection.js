// Supabase Direct Connection Test
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Supabase Connection Bilgileri
const config = {
  host: 'db.rxbtkjihvqjmamdwmsev.supabase.co',
  port: 6543,
  database: 'postgres',
  user: 'postgres',
  password: 'orhanozan33', // İlk önce orhanozan33 dene
  ssl: {
    rejectUnauthorized: false
  },
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
      console.error('⚠️  Denenecek sifreler:');
      console.error('    1. orhanozan33');
      console.error('    2. postgres');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error('⚠️  Connection refused - Host veya port yanlis olabilir');
      console.error('⚠️  Kontrol edin:');
      console.error('    - Host: db.rxbtkjihvqjmamdwmsev.supabase.co');
      console.error('    - Port: 6543 (Session Pooler) veya 5432 (Direct)');
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

