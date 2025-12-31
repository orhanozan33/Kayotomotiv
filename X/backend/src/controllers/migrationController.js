import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migration'ları çalıştır
export const runMigrations = async (req, res, next) => {
  const client = await pool.connect();
  const results = [];
  
  try {
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${files.length} migration files`);
    
    for (const file of files) {
      try {
        console.log(`Running migration: ${file}`);
        let sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        // SQL dosyasındaki statement'ları ayır
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--') && s !== '');
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const statement of statements) {
          if (statement) {
            try {
              await client.query(statement + ';');
              successCount++;
            } catch (stmtError) {
              // Eğer tablo/extension zaten varsa devam et
              if (stmtError.message.includes('already exists') || 
                  stmtError.message.includes('duplicate') || 
                  stmtError.code === '42P07' || 
                  stmtError.code === '42710' ||
                  stmtError.code === '42883' ||
                  stmtError.code === '23505' ||
                  (stmtError.message.includes('does not exist') && stmtError.message.includes('extension'))) {
                // Devam et, bu normal
                successCount++;
              } else {
                errorCount++;
                console.error(`  ❌ Statement failed: ${stmtError.message}`);
              }
            }
          }
        }
        
        results.push({
          file,
          status: errorCount === 0 ? 'success' : 'partial',
          successCount,
          errorCount
        });
        
        console.log(`✅ Completed: ${file}`);
      } catch (error) {
        results.push({
          file,
          status: 'error',
          error: error.message
        });
        console.error(`❌ Migration ${file} failed:`, error.message);
      }
    }
    
    res.json({
      success: true,
      message: 'Migrations completed',
      results,
      total: files.length,
      successful: results.filter(r => r.status === 'success').length
    });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

// Migration durumunu kontrol et
export const checkMigrationStatus = async (req, res, next) => {
  const client = await pool.connect();
  try {
    // Tüm tabloları kontrol et
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    // Migration dosyalarını listele
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    res.json({
      tables: tables,
      migrationFiles: files,
      tableCount: tables.length,
      migrationFileCount: files.length
    });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

// Public migration endpoint - sadece users tablosu yoksa çalışır (ilk kurulum için)
export const runMigrationsPublic = async (req, res, next) => {
  const client = await pool.connect();
  try {
    // Önce users tablosunun var olup olmadığını kontrol et
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    // Eğer users tablosu varsa, bu endpoint artık çalışmaz (güvenlik)
    if (checkResult.rows[0].exists) {
      return res.status(403).json({
        error: 'Migration already completed',
        message: 'Users table exists. Please use authenticated endpoint.'
      });
    }
    
    // Users tablosu yoksa migration'ları çalıştır
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${files.length} migration files (public endpoint)`);
    
    const results = [];
    
    for (const file of files) {
      try {
        console.log(`Running migration: ${file}`);
        let sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--') && s !== '');
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const statement of statements) {
          if (statement) {
            try {
              await client.query(statement + ';');
              successCount++;
            } catch (stmtError) {
              if (stmtError.message.includes('already exists') || 
                  stmtError.message.includes('duplicate') || 
                  stmtError.code === '42P07' || 
                  stmtError.code === '42710' ||
                  stmtError.code === '42883' ||
                  stmtError.code === '23505' ||
                  (stmtError.message.includes('does not exist') && stmtError.message.includes('extension'))) {
                successCount++;
              } else {
                errorCount++;
                console.error(`  ❌ Statement failed: ${stmtError.message}`);
              }
            }
          }
        }
        
        results.push({
          file,
          status: errorCount === 0 ? 'success' : 'partial',
          successCount,
          errorCount
        });
        
        console.log(`✅ Completed: ${file}`);
      } catch (error) {
        results.push({
          file,
          status: 'error',
          error: error.message
        });
        console.error(`❌ Migration ${file} failed:`, error.message);
      }
    }
    
    res.json({
      success: true,
      message: 'Migrations completed (public endpoint)',
      results,
      total: files.length,
      successful: results.filter(r => r.status === 'success').length
    });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

