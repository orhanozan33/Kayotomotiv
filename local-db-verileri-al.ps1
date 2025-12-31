# Local Database Verilerini Al
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LOCAL DATABASE VERILERINI ALMA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Local database bilgileri
$localDbConfig = @{
    host = "localhost"
    port = 5432
    database = "ototamir"
    user = "postgres"
    password = "333333"
}

Write-Host "Local Database Bilgileri:" -ForegroundColor Yellow
Write-Host "  Host: $($localDbConfig.host)" -ForegroundColor White
Write-Host "  Port: $($localDbConfig.port)" -ForegroundColor White
Write-Host "  Database: $($localDbConfig.database)" -ForegroundColor White
Write-Host "  User: $($localDbConfig.user)" -ForegroundColor White
Write-Host ""

# Node.js script ile verileri al
$exportScript = @"
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
    console.log('Local database baglantisi deneniyor...');
    const localClient = await localPool.connect();
    console.log('OK: Local database baglandi');
    
    // Vehicles verilerini al
    console.log('Vehicles verileri aliniyor...');
    const vehiclesResult = await localClient.query('SELECT * FROM vehicles ORDER BY created_at');
    console.log('OK: ' + vehiclesResult.rows.length + ' araç bulundu');
    
    // Vehicle images verilerini al
    console.log('Vehicle images verileri aliniyor...');
    const imagesResult = await localClient.query('SELECT * FROM vehicle_images ORDER BY vehicle_id, display_order');
    console.log('OK: ' + imagesResult.rows.length + ' resim bulundu');
    
    localClient.release();
    
    // Supabase'e baglan
    console.log('Supabase baglantisi deneniyor...');
    const supabaseClient = await supabasePool.connect();
    console.log('OK: Supabase baglandi');
    
    // Vehicles verilerini Supabase'e ekle
    console.log('Vehicles verileri Supabase\'e ekleniyor...');
    for (const vehicle of vehiclesResult.rows) {
      try {
        await supabaseClient.query(
          \`INSERT INTO vehicles (id, brand, model, year, price, mileage, fuel_type, transmission, color, description, status, reservation_end_time, created_at, updated_at)
           VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11, \$12, \$13, \$14)
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
           updated_at = EXCLUDED.updated_at\`,
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
        console.log('OK: Araç eklendi: ' + vehicle.brand + ' ' + vehicle.model);
      } catch (err) {
        console.error('ERROR: Araç eklenemedi:', vehicle.id, err.message);
      }
    }
    
    // Vehicle images verilerini Supabase'e ekle
    console.log('Vehicle images verileri Supabase\'e ekleniyor...');
    for (const image of imagesResult.rows) {
      try {
        await supabaseClient.query(
          \`INSERT INTO vehicle_images (id, vehicle_id, image_url, is_primary, display_order, created_at)
           VALUES (\$1, \$2, \$3, \$4, \$5, \$6)
           ON CONFLICT (id) DO UPDATE SET
           vehicle_id = EXCLUDED.vehicle_id,
           image_url = EXCLUDED.image_url,
           is_primary = EXCLUDED.is_primary,
           display_order = EXCLUDED.display_order\`,
          [
            image.id,
            image.vehicle_id,
            image.image_url,
            image.is_primary || false,
            image.display_order || 0,
            image.created_at || new Date()
          ]
        );
        console.log('OK: Resim eklendi: ' + image.id);
      } catch (err) {
        console.error('ERROR: Resim eklenemedi:', image.id, err.message);
      }
    }
    
    supabaseClient.release();
    
    console.log('');
    console.log('========================================');
    console.log('TAMAMLANDI!');
    console.log('========================================');
    console.log('Araç sayısı: ' + vehiclesResult.rows.length);
    console.log('Resim sayısı: ' + imagesResult.rows.length);
    
    await localPool.end();
    await supabasePool.end();
    
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

exportData();
"@

$exportScriptPath = Join-Path $PSScriptRoot "local-to-supabase-export.js"
$exportScript | Out-File -FilePath $exportScriptPath -Encoding utf8

Write-Host "Export script olusturuldu: local-to-supabase-export.js" -ForegroundColor Green
Write-Host ""
Write-Host "Script calistiriliyor..." -ForegroundColor Yellow
Write-Host ""

Set-Location backend
try {
    node "../local-to-supabase-export.js"
} catch {
    Write-Host "ERROR: Script calistirilamadi" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
Set-Location ..

Remove-Item $exportScriptPath -ErrorAction SilentlyContinue

