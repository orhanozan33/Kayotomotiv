import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// NOT: Bu dosya artık kullanılmıyor - Supabase kullanılıyor!
// Supabase'de database oluşturma gerekmez, 'postgres' database'i kullanılır

// Connect to Supabase database
const missing = [];
const host = process.env.DB_HOST;
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

if (!host) missing.push('DB_HOST');
if (!port || Number.isNaN(port)) missing.push('DB_PORT');
if (!user) missing.push('DB_USER');
if (!password) missing.push('DB_PASSWORD');

if (missing.length > 0) {
  console.error('❌ Eksik DB env vars:', missing.join(', '));
  process.exit(1);
}

const adminPool = new Pool({
  host,
  port,
  database: 'postgres', // Supabase default database
  user,
  password,
  ssl: {
    rejectUnauthorized: false
  },
});

// NOT: Bu dosya artık kullanılmıyor - Supabase kullanılıyor!
// Supabase'de database oluşturma gerekmez, 'postgres' database'i kullanılır
const dbName = process.env.DB_NAME || 'postgres'; // For Supabase this should stay 'postgres'

async function createDatabase() {
  try {
    console.log(`Creating database: ${dbName}...`);
    
    // Check if database exists
    const checkResult = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkResult.rows.length > 0) {
      console.log(`✅ Database ${dbName} already exists`);
      await adminPool.end();
      return;
    }

    // Create database
    await adminPool.query(`CREATE DATABASE ${dbName}`);
    console.log(`✅ Database ${dbName} created successfully`);
    
    await adminPool.end();
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    await adminPool.end();
    process.exit(1);
  }
}

createDatabase();


