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
const adminPool = new Pool({
  host: process.env.DB_HOST || 'db.rxbtkjihvqjmamdwmsev.supabase.co',
  port: parseInt(process.env.DB_PORT) || 6543,
  database: 'postgres', // Supabase default database
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'orhanozan33',
  ssl: {
    rejectUnauthorized: false
  },
});

// NOT: Bu dosya artık kullanılmıyor - Supabase kullanılıyor!
// Supabase'de database oluşturma gerekmez, 'postgres' database'i kullanılır
const dbName = process.env.DB_NAME || 'postgres'; // Supabase database

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


