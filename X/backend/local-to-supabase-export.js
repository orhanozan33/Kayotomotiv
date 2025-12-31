import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Local DB connection must come from env vars (so we never hard-code credentials)
const localMissing = [];
const LOCAL_DB_HOST = process.env.LOCAL_DB_HOST;
const LOCAL_DB_PORT = process.env.LOCAL_DB_PORT ? Number(process.env.LOCAL_DB_PORT) : undefined;
const LOCAL_DB_NAME = process.env.LOCAL_DB_NAME;
const LOCAL_DB_USER = process.env.LOCAL_DB_USER;
const LOCAL_DB_PASSWORD = process.env.LOCAL_DB_PASSWORD;

if (!LOCAL_DB_HOST) localMissing.push('LOCAL_DB_HOST');
if (!LOCAL_DB_PORT || Number.isNaN(LOCAL_DB_PORT)) localMissing.push('LOCAL_DB_PORT');
if (!LOCAL_DB_NAME) localMissing.push('LOCAL_DB_NAME');
if (!LOCAL_DB_USER) localMissing.push('LOCAL_DB_USER');
if (!LOCAL_DB_PASSWORD) localMissing.push('LOCAL_DB_PASSWORD');

// Supabase/target DB uses the standard DB_* vars
const supaMissing = [];
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

if (!DB_HOST) supaMissing.push('DB_HOST');
if (!DB_PORT || Number.isNaN(DB_PORT)) supaMissing.push('DB_PORT');
if (!DB_NAME) supaMissing.push('DB_NAME');
if (!DB_USER) supaMissing.push('DB_USER');
if (!DB_PASSWORD) supaMissing.push('DB_PASSWORD');

if (localMissing.length > 0 || supaMissing.length > 0) {
  console.error('❌ Eksik env var(lar) var.');
  if (localMissing.length > 0) console.error('  Local DB:', localMissing.join(', '));
  if (supaMissing.length > 0) console.error('  Target DB:', supaMissing.join(', '));
  console.error('👉 Bu scripti kullanmıyorsanız görmezden gelebilirsiniz.');
  process.exit(1);
}

const localPool = new Pool({
  host: LOCAL_DB_HOST,
  port: LOCAL_DB_PORT,
  database: LOCAL_DB_NAME,
  user: LOCAL_DB_USER,
  password: LOCAL_DB_PASSWORD,
});

const supabasePool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
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

