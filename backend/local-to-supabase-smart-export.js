import pg from 'pg';

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

// Tablo mapping: local -> supabase (sütun farklılıkları)
const tableMappings = {
  'vehicles': {
    columns: ['id', 'brand', 'model', 'year', 'price', 'mileage', 'fuel_type', 'transmission', 'color', 'description', 'status', 'reservation_end_time', 'created_at', 'updated_at'],
    skipColumns: ['featured', 'created_by']
  },
  'repair_services': {
    columns: ['id', 'name', 'description', 'price', 'is_active', 'created_at', 'updated_at'],
    skipColumns: ['category', 'base_price', 'display_order']
  },
  'repair_quotes': {
    columns: ['id', 'user_id', 'first_name', 'last_name', 'email', 'phone', 'vehicle_brand', 'vehicle_model', 'vehicle_year', 'license_plate', 'service_description', 'status', 'estimated_price', 'final_price', 'notes', 'created_at', 'updated_at'],
    skipColumns: ['customer_name', 'customer_email', 'customer_phone', 'total_price']
  },
  'car_wash_packages': {
    columns: ['id', 'name', 'description', 'price', 'duration_minutes', 'is_active', 'created_at', 'updated_at'],
    skipColumns: ['base_price', 'display_order']
  },
  'car_wash_addons': {
    columns: ['id', 'name', 'description', 'price', 'is_active', 'created_at', 'updated_at'],
    skipColumns: ['display_order']
  },
  'car_wash_appointments': {
    columns: ['id', 'user_id', 'package_id', 'first_name', 'last_name', 'email', 'phone', 'vehicle_brand', 'vehicle_model', 'vehicle_year', 'license_plate', 'appointment_date', 'appointment_time', 'addon_ids', 'total_price', 'status', 'notes', 'created_at', 'updated_at'],
    skipColumns: ['customer_name', 'customer_email', 'customer_phone', 'package_name', 'package_price']
  },
  'customers': {
    columns: ['id', 'first_name', 'last_name', 'email', 'phone', 'address', 'notes', 'created_at', 'updated_at'],
    skipColumns: ['vehicle_brand', 'vehicle_model', 'vehicle_year', 'total_spent', 'created_by']
  },
  'customer_vehicles': {
    columns: ['id', 'customer_id', 'brand', 'model', 'year', 'license_plate', 'color', 'notes', 'created_at', 'updated_at'],
    skipColumns: ['vin', 'mileage']
  },
  'service_records': {
    columns: ['id', 'customer_id', 'vehicle_id', 'service_type', 'service_date', 'description', 'cost', 'notes', 'created_at', 'updated_at'],
    skipColumns: ['service_name']
  },
  'pages': {
    columns: ['id', 'slug', 'title', 'content', 'meta_description', 'is_active', 'created_at', 'updated_at'],
    skipColumns: ['created_by']
  },
  'user_permissions': {
    columns: ['id', 'user_id', 'page', 'can_view', 'can_edit', 'can_delete', 'password_hash', 'created_at', 'updated_at'],
    skipColumns: ['can_add']
  }
};

async function exportTable(tableName, localClient, supabaseClient) {
  try {
    // Tablo var mı kontrol et
    const tableExists = await supabaseClient.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `, [tableName]);
    
    if (!tableExists.rows[0].exists) {
      console.log(`   ⚠️  ${tableName}: Tablo Supabase'de yok, atlanıyor`);
      return { added: 0, updated: 0, error: 0, total: 0, skipped: true };
    }
    
    // Local'den verileri al
    const result = await localClient.query(`SELECT * FROM ${tableName} ORDER BY created_at`);
    
    if (result.rows.length === 0) {
      console.log(`   ⚠️  ${tableName}: Veri yok`);
      return { added: 0, updated: 0, error: 0, total: 0 };
    }
    
    console.log(`   📥 ${tableName}: ${result.rows.length} kayıt bulundu`);
    
    // Supabase'deki sütunları al
    const supabaseColumnsResult = await supabaseClient.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);
    
    const supabaseColumns = supabaseColumnsResult.rows.map(row => row.column_name);
    
    // Mapping varsa kullan, yoksa tüm sütunları dene
    let columnsToUse = supabaseColumns;
    if (tableMappings[tableName]) {
      columnsToUse = tableMappings[tableName].columns.filter(col => supabaseColumns.includes(col));
    } else {
      // Local'deki sütunları al
      const localColumnsResult = await localClient.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      const localColumns = localColumnsResult.rows.map(row => row.column_name);
      // Sadece her iki tarafta da olan sütunları kullan
      columnsToUse = localColumns.filter(col => supabaseColumns.includes(col));
    }
    
    if (columnsToUse.length === 0) {
      console.log(`   ⚠️  ${tableName}: Uyumlu sütun bulunamadı`);
      return { added: 0, updated: 0, error: 0, total: result.rows.length, skipped: true };
    }
    
    // Primary key bul
    const pkResult = await supabaseClient.query(`
      SELECT column_name 
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name)
      WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = $1
    `, [tableName]);
    
    const pkColumn = pkResult.rows[0]?.column_name || 'id';
    
    // Supabase'e ekle
    let added = 0;
    let error = 0;
    
    for (const row of result.rows) {
      try {
        // Sadece mevcut sütunları kullan
        const values = [];
        const placeholders = [];
        let paramCount = 1;
        
        for (const col of columnsToUse) {
          if (row[col] !== undefined) {
            placeholders.push(`$${paramCount++}`);
            values.push(row[col]);
          } else {
            placeholders.push('NULL');
          }
        }
        
        // UPDATE clause için (PK hariç)
        const updateColumns = columnsToUse.filter(col => col !== pkColumn);
        const updateClause = updateColumns.map(col => `${col} = EXCLUDED.${col}`).join(', ');
        
        const insertQuery = `
          INSERT INTO ${tableName} (${columnsToUse.join(', ')})
          VALUES (${placeholders.join(', ')})
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
    
    return { added, updated: 0, error, total: result.rows.length };
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
    
    // Tüm tabloları dene
    const allTables = [
      'users',
      'vehicles',
      'vehicle_images',
      'reservations',
      'test_drives',
      'repair_services',
      'repair_quotes',
      'repair_appointments',
      'car_wash_packages',
      'car_wash_addons',
      'car_wash_appointments',
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
    
    // Her tablo için export işlemi
    for (const table of allTables) {
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
      if (stat.total > 0 || stat.added > 0) {
        totalAdded += stat.added;
        totalError += stat.error;
        totalRecords += stat.total;
        
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

