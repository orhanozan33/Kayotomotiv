import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSingleMigration(migrationFile) {
  try {
    const migrationPath = path.join(__dirname, '../../migrations', migrationFile);
    console.log(`Running migration: ${migrationFile}`);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    await pool.query(sql);
    console.log(`✅ Completed: ${migrationFile}`);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Usage: node run_single_migration.js <migration_file>');
  process.exit(1);
}

runSingleMigration(migrationFile);

