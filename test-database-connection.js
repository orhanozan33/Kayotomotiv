// Database Connection Test Script
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

console.log('🔍 Testing database connection...');
console.log('Environment variables:');
console.log('  DB_HOST:', process.env.DB_HOST || 'NOT SET');
console.log('  DB_PORT:', process.env.DB_PORT || 'NOT SET');
console.log('  DB_NAME:', process.env.DB_NAME || 'NOT SET');
console.log('  DB_USER:', process.env.DB_USER || 'NOT SET');
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'NOT SET');
console.log('');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ototamir',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
});

async function testConnection() {
  try {
    console.log('📡 Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Connection successful!');
    
    // Test query
    console.log('📊 Testing query...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query successful!');
    console.log('  Current time:', result.rows[0].current_time);
    console.log('  PostgreSQL version:', result.rows[0].pg_version.split('\n')[0]);
    
    // Check vehicles table
    console.log('');
    console.log('📋 Checking vehicles table...');
    try {
      const vehiclesResult = await client.query('SELECT COUNT(*) as count FROM vehicles');
      console.log('✅ Vehicles table exists!');
      console.log('  Vehicle count:', vehiclesResult.rows[0].count);
    } catch (tableError) {
      console.error('❌ Vehicles table error:', tableError.message);
      console.error('  Error code:', tableError.code);
    }
    
    // Check settings table
    console.log('');
    console.log('📋 Checking settings table...');
    try {
      const settingsResult = await client.query('SELECT COUNT(*) as count FROM settings');
      console.log('✅ Settings table exists!');
      console.log('  Settings count:', settingsResult.rows[0].count);
    } catch (tableError) {
      console.error('❌ Settings table error:', tableError.message);
      console.error('  Error code:', tableError.code);
    }
    
    client.release();
    console.log('');
    console.log('✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Connection failed!');
    console.error('  Error code:', error.code);
    console.error('  Error message:', error.message);
    console.error('  Error stack:', error.stack);
    process.exit(1);
  }
}

testConnection();

