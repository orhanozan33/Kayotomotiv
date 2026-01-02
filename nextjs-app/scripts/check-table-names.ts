import 'dotenv/config';
import { getPool } from '../lib/config/database';

async function checkTableNames() {
  try {
    const pool = getPool();
    
    // Check if vehicles table exists
    const vehiclesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'vehicles'
      );
    `);
    
    // Check if auto_sales table exists
    const autoSalesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'auto_sales'
      );
    `);
    
    // Check vehicle_images table
    const vehicleImagesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'vehicle_images'
      );
    `);
    
    // Check auto_sales_images table
    const autoSalesImagesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'auto_sales_images'
      );
    `);
    
    console.log('📊 Table check:');
    console.log(`  - vehicles table exists: ${vehiclesCheck.rows[0].exists}`);
    console.log(`  - auto_sales table exists: ${autoSalesCheck.rows[0].exists}`);
    console.log(`  - vehicle_images table exists: ${vehicleImagesCheck.rows[0].exists}`);
    console.log(`  - auto_sales_images table exists: ${autoSalesImagesCheck.rows[0].exists}`);
    
    if (vehiclesCheck.rows[0].exists) {
      const count = await pool.query('SELECT COUNT(*) as count FROM vehicles');
      console.log(`  - vehicles table has ${count.rows[0].count} rows`);
    }
    
    if (vehicleImagesCheck.rows[0].exists) {
      const count = await pool.query('SELECT COUNT(*) as count FROM vehicle_images');
      console.log(`  - vehicle_images table has ${count.rows[0].count} rows`);
    }
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkTableNames();
