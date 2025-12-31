import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, '../../migrations');

async function runNewMigrations() {
  try {
    // Run migration 007
    console.log('Running migration 007_user_permissions.sql...');
    const migration1 = fs.readFileSync(path.join(migrationsDir, '007_user_permissions.sql'), 'utf8');
    await pool.query(migration1);
    console.log('✅ Migration 007 completed');

    // Run migration 008
    console.log('Running migration 008_update_user_role.sql...');
    const migration2 = fs.readFileSync(path.join(migrationsDir, '008_update_user_role.sql'), 'utf8');
    await pool.query(migration2);
    console.log('✅ Migration 008 completed');

    console.log('✅ All new migrations completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate') || error.code === '42P07' || error.code === '42710') {
      console.log('⚠️ Migration already applied (this is OK)');
      await pool.end();
      process.exit(0);
    } else {
      console.error('❌ Migration failed:', error.message);
      await pool.end();
      process.exit(1);
    }
  }
}

runNewMigrations();

