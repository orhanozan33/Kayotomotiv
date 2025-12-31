import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;

const localPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ototamir',
  user: 'postgres',
  password: '333333',
});

const supabasePool = new Pool({
  host: 'db.rxbtkjihvqjmamdwmsev.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'orhanozan33',
  ssl: { rejectUnauthorized: false },
});

async function exportData() {
  try {
    console.log('🔍 Local database baglantisi deneniyor...');
    const localClient = await localPool.connect();
    console.log('✅ Local database baglandi');
    
    // Vehicles verilerini al
    console.log('📥 Vehicles verileri aliniyor...');
    const vehiclesResult = await localClient.query('SELECT * FROM vehicles ORDER BY created_at');
    console.log(`✅ ${vehiclesResult.rows.length} araç bulundu`);
    
    // Vehicle images verilerini al
    console.log('📥 Vehicle images verileri aliniyor...');
    const imagesResult = await localClient.query('SELECT * FROM vehicle_images ORDER BY vehicle_id, display_order');
    console.log(`✅ ${imagesResult.rows.length} resim bulundu`);
    
    localClient.release();
    
    if (vehiclesResult.rows.length === 0) {
      console.log('⚠️  Local database\'de araç bulunamadi!');
      await localPool.end();
      await supabasePool.end();
      return;
    }
    
    // Supabase'e baglan
    console.log('🔍 Supabase baglantisi deneniyor...');
    const supabaseClient = await supabasePool.connect();
    console.log('✅ Supabase baglandi');
    
    // Vehicles verilerini Supabase'e ekle
    console.log('📤 Vehicles verileri Supabase\'e ekleniyor...');
    let vehiclesAdded = 0;
    let vehiclesUpdated = 0;
    let vehiclesError = 0;
    
    for (const vehicle of vehiclesResult.rows) {
      try {
        const result = await supabaseClient.query(
          `INSERT INTO vehicles (id, brand, model, year, price, mileage, fuel_type, transmission, color, description, status, reservation_end_time, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO UPDATE SET
           brand = EXCLUDED.brand,
           model = EXCLUDED.model,
           year = EXCLUDED.year,
           price = EXCLUDED.price,
           mileage = EXCLUDED.mileage,
           fuel_type = EXCLUDED.fuel_type,
           transmission = EXCLUDED.transmission,
           color = EXCLUDED.color,
           description = EXCLUDED.description,
           status = EXCLUDED.status,
           reservation_end_time = EXCLUDED.reservation_end_time,
           updated_at = EXCLUDED.updated_at`,
          [
            vehicle.id,
            vehicle.brand,
            vehicle.model,
            vehicle.year,
            vehicle.price,
            vehicle.mileage,
            vehicle.fuel_type,
            vehicle.transmission,
            vehicle.color,
            vehicle.description,
            vehicle.status || 'available',
            vehicle.reservation_end_time,
            vehicle.created_at,
            vehicle.updated_at || new Date()
          ]
        );
        
        // Check if it was an insert or update
        if (result.rowCount > 0) {
          const checkResult = await supabaseClient.query('SELECT created_at FROM vehicles WHERE id = $1', [vehicle.id]);
          const existingCreatedAt = checkResult.rows[0]?.created_at;
          if (existingCreatedAt && new Date(existingCreatedAt).getTime() === new Date(vehicle.created_at).getTime()) {
            vehiclesAdded++;
            console.log(`✅ Araç eklendi: ${vehicle.brand} ${vehicle.model} (${vehicle.id})`);
          } else {
            vehiclesUpdated++;
            console.log(`🔄 Araç güncellendi: ${vehicle.brand} ${vehicle.model} (${vehicle.id})`);
          }
        }
      } catch (err) {
        vehiclesError++;
        console.error(`❌ Araç eklenemedi: ${vehicle.brand} ${vehicle.model} (${vehicle.id}) - ${err.message}`);
      }
    }
    
    // Vehicle images verilerini Supabase'e ekle
    console.log('📤 Vehicle images verileri Supabase\'e ekleniyor...');
    let imagesAdded = 0;
    let imagesUpdated = 0;
    let imagesError = 0;
    
    for (const image of imagesResult.rows) {
      try {
        const result = await supabaseClient.query(
          `INSERT INTO vehicle_images (id, vehicle_id, image_url, is_primary, display_order, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
           vehicle_id = EXCLUDED.vehicle_id,
           image_url = EXCLUDED.image_url,
           is_primary = EXCLUDED.is_primary,
           display_order = EXCLUDED.display_order`,
          [
            image.id,
            image.vehicle_id,
            image.image_url,
            image.is_primary || false,
            image.display_order || 0,
            image.created_at || new Date()
          ]
        );
        
        if (result.rowCount > 0) {
          imagesAdded++;
          console.log(`✅ Resim eklendi: ${image.id}`);
        } else {
          imagesUpdated++;
          console.log(`🔄 Resim güncellendi: ${image.id}`);
        }
      } catch (err) {
        imagesError++;
        console.error(`❌ Resim eklenemedi: ${image.id} - ${err.message}`);
      }
    }
    
    supabaseClient.release();
    
    console.log('');
    console.log('========================================');
    console.log('✅ TAMAMLANDI!');
    console.log('========================================');
    console.log(`📊 Araçlar:`);
    console.log(`   ✅ Eklendi: ${vehiclesAdded}`);
    console.log(`   🔄 Güncellendi: ${vehiclesUpdated}`);
    console.log(`   ❌ Hata: ${vehiclesError}`);
    console.log(`   📦 Toplam: ${vehiclesResult.rows.length}`);
    console.log('');
    console.log(`📊 Resimler:`);
    console.log(`   ✅ Eklendi: ${imagesAdded}`);
    console.log(`   🔄 Güncellendi: ${imagesUpdated}`);
    console.log(`   ❌ Hata: ${imagesError}`);
    console.log(`   📦 Toplam: ${imagesResult.rows.length}`);
    console.log('');
    
    await localPool.end();
    await supabasePool.end();
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

exportData();

