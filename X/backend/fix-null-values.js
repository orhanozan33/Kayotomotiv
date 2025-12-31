import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const missing = [];
const host = process.env.DB_HOST;
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
const database = process.env.DB_NAME;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

if (!host) missing.push('DB_HOST');
if (!port || Number.isNaN(port)) missing.push('DB_PORT');
if (!database) missing.push('DB_NAME');
if (!user) missing.push('DB_USER');
if (!password) missing.push('DB_PASSWORD');

if (missing.length > 0) {
  throw new Error(`Missing DB env vars: ${missing.join(', ')}`);
}

const supabasePool = new Pool({
  host,
  port,
  database,
  user,
  password,
  ssl: { rejectUnauthorized: false },
});

async function fixNullValues() {
  try {
    console.log('🔍 Supabase baglantisi deneniyor...');
    const client = await supabasePool.connect();
    console.log('✅ Supabase baglandi\n');
    
    console.log('🔧 NULL değerler düzeltiliyor...\n');
    
    // repair_quotes: first_name ve last_name NULL ise customer_name'den al
    console.log('📋 repair_quotes düzeltiliyor...');
    const repairQuotesResult = await client.query(`
      UPDATE repair_quotes 
      SET first_name = COALESCE(first_name, 'Müşteri'),
          last_name = COALESCE(last_name, '')
      WHERE first_name IS NULL OR last_name IS NULL
    `);
    console.log(`   ✅ ${repairQuotesResult.rowCount} kayıt düzeltildi\n`);
    
    // car_wash_packages: price NULL ise 0 yap
    console.log('📋 car_wash_packages düzeltiliyor...');
    const carWashPackagesResult = await client.query(`
      UPDATE car_wash_packages 
      SET price = COALESCE(price, 0)
      WHERE price IS NULL
    `);
    console.log(`   ✅ ${carWashPackagesResult.rowCount} kayıt düzeltildi\n`);
    
    // car_wash_appointments: first_name ve last_name NULL ise customer_name'den al
    console.log('📋 car_wash_appointments düzeltiliyor...');
    const carWashAppointmentsResult = await client.query(`
      UPDATE car_wash_appointments 
      SET first_name = COALESCE(first_name, 'Müşteri'),
          last_name = COALESCE(last_name, '')
      WHERE first_name IS NULL OR last_name IS NULL
    `);
    console.log(`   ✅ ${carWashAppointmentsResult.rowCount} kayıt düzeltildi\n`);
    
    // service_records: service_date NULL ise created_at kullan
    console.log('📋 service_records düzeltiliyor...');
    const serviceRecordsResult = await client.query(`
      UPDATE service_records 
      SET service_date = COALESCE(service_date, created_at::date, CURRENT_DATE)
      WHERE service_date IS NULL
    `);
    console.log(`   ✅ ${serviceRecordsResult.rowCount} kayıt düzeltildi\n`);
    
    client.release();
    
    console.log('========================================');
    console.log('✅ TAMAMLANDI!');
    console.log('========================================\n');
    
    await supabasePool.end();
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

fixNullValues();

