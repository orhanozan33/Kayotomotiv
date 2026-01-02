import 'dotenv/config';
import { getPool } from '../lib/config/database';

async function fixNullEmails() {
  try {
    const pool = getPool();
    
    // First, check how many users have null emails
    const checkResult = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE email IS NULL'
    );
    const nullEmailCount = parseInt(checkResult.rows[0].count);
    
    console.log(`🔍 Found ${nullEmailCount} users with null email`);
    
    if (nullEmailCount > 0) {
      // Delete users with null emails (they are invalid records)
      const deleteResult = await pool.query(
        'DELETE FROM users WHERE email IS NULL'
      );
      
      console.log(`✅ Deleted ${deleteResult.rowCount} users with null email`);
    }
    
    // Now try to set email column to NOT NULL
    try {
      await pool.query('ALTER TABLE users ALTER COLUMN email SET NOT NULL');
      console.log('✅ Email column set to NOT NULL');
    } catch (alterError: any) {
      if (alterError.code === '42704') {
        console.log('ℹ️  Email column is already NOT NULL');
      } else if (alterError.code === '23502') {
        console.error('❌ Still have null emails. Please check database manually.');
        throw alterError;
      } else {
        throw alterError;
      }
    }
    
    console.log('✅ Database is now clean. You can restart the server.');
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error fixing null emails:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixNullEmails();

