import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function addPhoneSetting() {
  try {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ('contact_phone', '') ON CONFLICT (key) DO NOTHING`
    );
    console.log('✅ Phone setting added');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

addPhoneSetting();

