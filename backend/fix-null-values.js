import pg from 'pg';

const { Pool } = pg;

const supabasePool = new Pool({
  host: 'db.rxbtkjihvqjmamdwmsev.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'orhanozan33',
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

