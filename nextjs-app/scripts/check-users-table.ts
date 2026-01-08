import 'dotenv/config';
import { getPool } from '../lib/config/database';

async function checkUsersTable() {
  try {
    const pool = getPool();
    
    console.log('🔍 Checking users table structure...\n');
    
    // Check all columns in users table
    const columns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    columns.rows.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}, nullable=${col.is_nullable}, default=${col.column_default || 'NULL'}`);
    });
    
    // Check for null emails
    const nullEmails = await pool.query('SELECT COUNT(*) as count FROM users WHERE email IS NULL');
    console.log(`\n📊 Users with null email: ${nullEmails.rows[0].count}`);
    
    // Check total users
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Total users: ${totalUsers.rows[0].count}`);
    
    // Show sample users (without password)
    if (parseInt(totalUsers.rows[0].count) > 0) {
      const sampleUsers = await pool.query('SELECT id, email, role, is_active, created_at FROM users LIMIT 5');
      console.log('\n📋 Sample users:');
      sampleUsers.rows.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email || '(null)'} - ${user.role} - active: ${user.is_active}`);
      });
    }
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkUsersTable();









