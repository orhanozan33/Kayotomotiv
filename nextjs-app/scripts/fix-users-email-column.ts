import 'dotenv/config';
import { getPool } from '../lib/config/database';

async function fixUsersEmailColumn() {
  try {
    const pool = getPool();
    
    console.log('🔍 Checking users table structure...');
    
    // Check current email column structure
    const checkColumn = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email'
    `);
    
    if (checkColumn.rows.length === 0) {
      console.log('❌ Email column not found in users table!');
      process.exit(1);
    }
    
    const columnInfo = checkColumn.rows[0];
    console.log(`Current email column: nullable=${columnInfo.is_nullable}`);
    
    // Check for null emails
    const nullCount = await pool.query('SELECT COUNT(*) as count FROM users WHERE email IS NULL');
    const nullEmailCount = parseInt(nullCount.rows[0].count);
    console.log(`Found ${nullEmailCount} users with null email`);
    
    if (nullEmailCount > 0) {
      console.log('⚠️  Deleting users with null email...');
      const deleteResult = await pool.query('DELETE FROM users WHERE email IS NULL');
      console.log(`✅ Deleted ${deleteResult.rowCount} users with null email`);
    }
    
    // Set email to NOT NULL if it's nullable
    if (columnInfo.is_nullable === 'YES') {
      console.log('Setting email column to NOT NULL...');
      await pool.query('ALTER TABLE users ALTER COLUMN email SET NOT NULL');
      console.log('✅ Email column set to NOT NULL');
    } else {
      console.log('✅ Email column is already NOT NULL');
    }
    
    // Verify
    const verify = await pool.query(`
      SELECT is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email'
    `);
    console.log(`✅ Verification: email column nullable=${verify.rows[0].is_nullable}`);
    
    await pool.end();
    console.log('\n✅ Database is now ready. You can restart the server.');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixUsersEmailColumn();


