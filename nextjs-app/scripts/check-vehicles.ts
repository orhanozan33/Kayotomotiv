import 'dotenv/config';
import { getPool } from '../lib/config/database';

async function checkVehicles() {
  try {
    const pool = getPool();
    
    // Check vehicles table
    const vehiclesResult = await pool.query('SELECT COUNT(*) as count FROM vehicles');
    const vehicleCount = parseInt(vehiclesResult.rows[0].count);
    
    console.log(`Database'de ${vehicleCount} arac bulundu`);
    
    if (vehicleCount > 0) {
      // Get some vehicle details
      const vehicles = await pool.query(
        'SELECT id, brand, model, year, price, status FROM vehicles ORDER BY created_at DESC LIMIT 5'
      );
      console.log(`\nSon 5 arac:`);
      vehicles.rows.forEach((vehicle, index) => {
        console.log(`  ${index + 1}. ${vehicle.brand} ${vehicle.model} (${vehicle.year}) - $${vehicle.price} - ${vehicle.status}`);
      });
    } else {
      console.log('Database\'de hic arac yok!');
      console.log('Seed data calistirmak icin: npm run seed');
    }
    
    // Check vehicle_images table
    const imagesResult = await pool.query('SELECT COUNT(*) as count FROM vehicle_images');
    const imageCount = parseInt(imagesResult.rows[0].count);
    console.log(`\nDatabase'de ${imageCount} arac resmi bulundu`);
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Hata:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkVehicles();

