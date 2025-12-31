import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

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

// Tüm tabloları export et
const tables = [
  'users',
  'vehicles',
  'vehicle_images',
  'vehicle_reservations',
  'test_drive_requests',
  'repair_services',
  'repair_quotes',
  'repair_quote_items',
  'repair_appointments',
  'car_wash_packages',
  'car_wash_addons',
  'car_wash_appointments',
  'car_wash_appointment_addons',
  'customers',
  'customer_vehicles',
  'service_records',
  'pages',
  'settings',
  'company_settings',
  'receipts',
  'contact_messages',
  'user_permissions'
];

async function exportTable(tableName, localClient, supabaseClient) {
  try {
    // Local'den verileri al
    const result = await localClient.query(`SELECT * FROM ${tableName} ORDER BY created_at`);
    
    if (result.rows.length === 0) {
      console.log(`   ⚠️  ${tableName}: Veri yok`);
      return { added: 0, updated: 0, error: 0, total: 0 };
    }
    
    console.log(`   📥 ${tableName}: ${result.rows.length} kayıt bulundu`);
    
    // Tablo sütunlarını al
    const columnsResult = await localClient.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position
    `, [tableName]);
    
    const columns = columnsResult.rows.map(row => row.column_name);
    
    // Supabase'e ekle
    let added = 0;
    let updated = 0;
    let error = 0;
    
    for (const row of result.rows) {
      try {
        // Dynamic INSERT query
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const values = columns.map(col => row[col]);
        
        // ON CONFLICT için primary key bul
        const pkResult = await localClient.query(`
          SELECT column_name 
          FROM information_schema.table_constraints tc
          JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name)
          WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = $1
        `, [tableName]);
        
        const pkColumn = pkResult.rows[0]?.column_name || 'id';
        
        // UPDATE clause için tüm sütunları hazırla (PK hariç)
        const updateColumns = columns.filter(col => col !== pkColumn);
        const updateClause = updateColumns.map(col => `${col} = EXCLUDED.${col}`).join(', ');
        
        const insertQuery = `
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES (${placeholders})
          ON CONFLICT (${pkColumn}) DO UPDATE SET ${updateClause}
        `;
        
        await supabaseClient.query(insertQuery, values);
        added++;
        
        if (added % 10 === 0) {
          process.stdout.write('.');
        }
      } catch (err) {
        error++;
        if (error <= 3) {
          console.log(`\n      ❌ Hata: ${err.message.substring(0, 100)}`);
        }
      }
    }
    
    if (added > 0) {
      console.log(`\n   ✅ ${tableName}: ${added} kayıt eklendi/güncellendi`);
    }
    if (error > 0) {
      console.log(`   ⚠️  ${tableName}: ${error} hata`);
    }
    
    return { added, updated, error, total: result.rows.length };
  } catch (err) {
    console.error(`   ❌ ${tableName}: ${err.message}`);
    return { added: 0, updated: 0, error: 1, total: 0 };
  }
}

async function exportAllData() {
  const stats = {};
  
  try {
    console.log('🔍 Local database baglantisi deneniyor...');
    const localClient = await localPool.connect();
    console.log('✅ Local database baglandi\n');
    
    console.log('🔍 Supabase baglantisi deneniyor...');
    const supabaseClient = await supabasePool.connect();
    console.log('✅ Supabase baglandi\n');
    
    console.log('========================================');
    console.log('📤 TÜM VERİLER SUPABASE\'E AKTARILIYOR...');
    console.log('========================================\n');
    
    // Her tablo için export işlemi
    for (const table of tables) {
      console.log(`📋 ${table.toUpperCase()}:`);
      stats[table] = await exportTable(table, localClient, supabaseClient);
      console.log('');
    }
    
    localClient.release();
    supabaseClient.release();
    
    // Özet
    console.log('========================================');
    console.log('✅ TAMAMLANDI!');
    console.log('========================================\n');
    
    let totalAdded = 0;
    let totalError = 0;
    let totalRecords = 0;
    
    for (const [table, stat] of Object.entries(stats)) {
      totalAdded += stat.added;
      totalError += stat.error;
      totalRecords += stat.total;
      
      if (stat.total > 0) {
        console.log(`📊 ${table}:`);
        console.log(`   ✅ Eklendi/Güncellendi: ${stat.added}`);
        if (stat.error > 0) {
          console.log(`   ❌ Hata: ${stat.error}`);
        }
        console.log(`   📦 Toplam: ${stat.total}`);
        console.log('');
      }
    }
    
    console.log('========================================');
    console.log(`📊 GENEL ÖZET:`);
    console.log(`   ✅ Toplam Eklendi/Güncellendi: ${totalAdded}`);
    console.log(`   ❌ Toplam Hata: ${totalError}`);
    console.log(`   📦 Toplam Kayıt: ${totalRecords}`);
    console.log('========================================\n');
    
    await localPool.end();
    await supabasePool.end();
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

exportAllData();

