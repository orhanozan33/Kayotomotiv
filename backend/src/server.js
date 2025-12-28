import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
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

dotenv.config();

// Environment variable kontrolü (başlangıçta)
try {
  validateEnvironmentVariables();
  console.log('✅ Environment variables doğrulandı');
} catch (error) {
  console.error('❌ Environment variable hatası:', error.message);
  if (process.env.NODE_ENV === 'production') {
    console.error('Production ortamında tüm environment variable\'lar gerekli!');
    process.exit(1);
  } else {
    console.warn('⚠️  Development modu: Bazı environment variable\'lar eksik');
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware (before Helmet) - Güvenli hale getirildi
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : (process.env.NODE_ENV === 'production' ? [] : ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003']);

app.use(cors({
  origin: (origin, callback) => {
    // Same-origin requests (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
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
// Vehicle image from external source (public endpoint)
app.get('/api/vehicle-image/external', vehicleImageController.getVehicleImageFromExternal);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Auto-check expired reservations every minute
  setInterval(async () => {
    try {
      await pool.query(
        `UPDATE vehicles 
         SET status = 'available', reservation_end_time = NULL 
         WHERE status = 'reserved' 
         AND reservation_end_time IS NOT NULL 
         AND reservation_end_time < CURRENT_TIMESTAMP`
      );
    } catch (error) {
      console.error('Error checking expired reservations:', error);
    }
  }, 60000); // Check every minute
});

export default app;

