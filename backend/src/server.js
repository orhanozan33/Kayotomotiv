import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from './config/database.js';
import { validateEnvironmentVariables } from './utils/security.js';
import { apiLimiter, loginLimiter, backendPasswordLimiter, sqlExecutionLimiter } from './middleware/rateLimiter.js';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';
import reservationRoutes from './routes/reservations.js';
import repairRoutes from './routes/repair.js';
import carWashRoutes from './routes/carWash.js';
import pageRoutes from './routes/pages.js';
import customerRoutes from './routes/customers.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';
import settingsRoutes from './routes/settings.js';
import receiptsRoutes from './routes/receipts.js';
import contactRoutes from './routes/contact.js';
import backendRoutes from './routes/backend.js';
import * as vehicleImageController from './controllers/vehicleImageController.js';
import * as migrationController from './controllers/migrationController.js';

dotenv.config();

// Environment variable kontrolü (başlangıçta)
// Vercel serverless environment'ta process.exit() kullanmayın - function crash olur
try {
  validateEnvironmentVariables();
  console.log('✅ Environment variables doğrulandı');
} catch (error) {
  console.error('❌ Environment variable hatası:', error.message);
  // Vercel serverless environment'ta process.exit() kullanma
  // Sadece uyar, ilk istekte hata alınacak
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    console.warn('⚠️  Vercel serverless environment: Environment variable\'lar eksik olabilir');
    console.warn('⚠️  İlk istekte hata alınabilir - environment variables\'ları kontrol edin');
  } else if (process.env.NODE_ENV === 'production') {
    console.error('Production ortamında tüm environment variable\'lar gerekli!');
    // Sadece non-serverless production'da exit
    if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
      process.exit(1);
    }
  } else {
    console.warn('⚠️  Development modu: Bazı environment variable\'lar eksik');
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migration fonksiyonu
async function checkAndRunMigrations() {
  const client = await pool.connect();
  try {
    // vehicles tablosunun var olup olmadığını kontrol et
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'vehicles'
      );
    `);
    
    if (checkResult.rows[0].exists) {
      console.log('✅ Database tables already exist, skipping migrations');
      return;
    }
    
    console.log('⚠️  Database tables not found, running migrations...');
    const migrationsDir = path.join(__dirname, '../migrations');
    console.log(`Migration directory: ${migrationsDir}`);
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${files.length} migration files`);
    
    for (const file of files) {
      try {
        console.log(`Running migration: ${file}`);
        let sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        // SQL dosyasındaki comment'leri temizle (opsiyonel, çalışması için gerekli değil)
        // Her statement'ı ayrı çalıştır
        // Basit bölme: noktalı virgül ile böl (string içindeki noktalı virgülleri ignore etmeyiz, çünkü migration dosyalarında genelde yok)
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--') && s !== '');
        
        for (const statement of statements) {
          if (statement) {
            try {
              await client.query(statement + ';');
            } catch (stmtError) {
              // Eğer tablo/extension zaten varsa devam et
              if (stmtError.message.includes('already exists') || 
                  stmtError.message.includes('duplicate') || 
                  stmtError.code === '42P07' || 
                  stmtError.code === '42710' ||
                  stmtError.code === '42883' || // function already exists
                  stmtError.code === '23505' || // unique constraint violation
                  stmtError.message.includes('does not exist') && stmtError.message.includes('extension')) {
                // Devam et, bu normal
                console.log(`  ⚠️  Statement already applied or skipped: ${statement.substring(0, 50)}...`);
              } else {
                // Gerçek hata, logla ama devam et
                console.error(`  ❌ Statement failed: ${stmtError.message}`);
                // Devam et, bir sonraki statement'ı dene
              }
            }
          }
        }
        
        console.log(`✅ Completed: ${file}`);
      } catch (error) {
        console.error(`❌ Migration ${file} failed:`, error.message);
        console.error(`Error code: ${error.code}`);
        // Migration hatası olsa bile devam et
      }
    }
    
    console.log('✅ All migrations completed');
  } catch (error) {
    console.error('❌ Migration check failed:', error.message);
    console.error('Error details:', error);
  } finally {
    client.release();
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy - Zeabur gibi platformlarda reverse proxy kullanıldığı için gerekli
// Sadece ilk proxy'ye güven (1), bu daha güvenli
app.set('trust proxy', 1);
console.log('✅ Trust proxy enabled (trusting 1 proxy) for rate limiting');

// CORS middleware (before Helmet) - Güvenli hale getirildi
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : (process.env.NODE_ENV === 'production' ? [] : ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003']);

app.use(cors({
  origin: (origin, callback) => {
    // Same-origin requests (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Vercel URL'lerine otomatik izin ver (hem production hem alias URL'leri)
    if (origin.includes('.vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // FRONTEND_URL'deki URL'lere izin ver
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy tarafından engellendi'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve uploaded files BEFORE Helmet (to bypass security headers for images)
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Security middleware (after static files)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false // Disable CSP for now to avoid conflicts
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting middleware
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kayotomotiv API Server',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Kayotomotiv API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      reservations: '/api/reservations',
      repair: '/api/repair',
      carWash: '/api/car-wash',
      pages: '/api/pages',
      customers: '/api/customers',
      settings: '/api/settings'
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/repair', repairRoutes);
app.use('/api/car-wash', carWashRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/backend', backendRoutes);
// Public migration endpoint - sadece ilk kurulum için (users tablosu yoksa)
app.post('/api/setup/run-migrations', migrationController.runMigrationsPublic);
// Vehicle image from external source (public endpoint)
app.get('/api/vehicle-image/external', vehicleImageController.getVehicleImageFromExternal);

// Serve frontend static files (production build)
// Only serve if frontend build directory exists
const frontendBuildPath = path.join(__dirname, '../public');
try {
  if (fs.existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
    
    // SPA fallback - tüm bilinmeyen route'ları index.html'e yönlendir (API route'ları hariç)
    app.get('*', (req, res, next) => {
      // API route'larını atla
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
    
    console.log('✅ Frontend static files serving enabled');
  } else {
    console.log('⚠️  Frontend build directory not found, skipping static file serving');
  }
} catch (error) {
  console.error('⚠️  Error setting up frontend static serving:', error.message);
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server only if not in Vercel serverless environment
// Vercel serverless functions don't need app.listen()
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Run migrations if needed
    await checkAndRunMigrations();
    
    // Auto-check expired reservations every minute (only if vehicles table exists)
    setInterval(async () => {
      try {
        // Check if vehicles table exists before running query
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'vehicles'
          );
        `);
        
        if (!tableCheck.rows[0].exists) {
          // Table doesn't exist yet, skip this check
          return;
        }
        
        await pool.query(
          `UPDATE vehicles 
           SET status = 'available', reservation_end_time = NULL 
           WHERE status = 'reserved' 
           AND reservation_end_time IS NOT NULL 
           AND reservation_end_time < CURRENT_TIMESTAMP`
        );
      } catch (error) {
        // Only log error if it's not a "table does not exist" error
        if (!error.message.includes('does not exist') && error.code !== '42P01') {
          console.error('Error checking expired reservations:', error);
        }
      }
    }, 60000); // Check every minute
  });
} else {
  // Vercel serverless environment - migrations already run in Supabase
  // Migration'lar Supabase'de çalıştırıldı, serverless'ta çalıştırmaya gerek yok
  // Sadece veritabanı bağlantısını test et
  pool.query('SELECT 1').then(() => {
    console.log('✅ Database connection successful');
  }).catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });
}

export default app;

