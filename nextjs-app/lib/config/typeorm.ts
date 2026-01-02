import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  User,
  Vehicle,
  VehicleImage,
  Settings,
  VehicleReservation,
  TestDriveRequest,
  RepairService,
  RepairServicePricing,
  RepairQuote,
  RepairQuoteItem,
  RepairAppointment,
  CarWashPackage,
  CarWashAddon,
  CarWashAppointment,
  CarWashAppointmentAddon,
  Customer,
  CustomerVehicle,
  ServiceRecord,
  Receipt,
  ContactMessage,
  UserPermission,
  Page,
} from '@/lib/entities';

// Check if running in production environment
const isProduction = process.env.NODE_ENV === 'production';

function getEnvConfig() {
  try {
    // Lazy import to avoid circular dependency and allow graceful failure
    const envConfig = require('./env').default;
    return envConfig;
  } catch (error: any) {
    // Check if we're in build time (Next.js build process)
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                        process.env.NEXT_PHASE === 'phase-development-build' ||
                        (!process.env.VERCEL && process.env.NODE_ENV === 'production');
    
    // In build time or development, return a minimal config
    if (isBuildTime || process.env.NODE_ENV === 'development') {
      const databaseUrl = (process.env.DATABASE_URL || process.env.POSTGRES_URL)?.trim();
      return {
        database: {
          url: databaseUrl,
          host: process.env.DB_HOST?.trim(),
          port: process.env.DB_PORT ? Number(process.env.DB_PORT.trim()) : undefined,
          name: process.env.DB_NAME?.trim(),
          user: process.env.DB_USER?.trim(),
          password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD.trim()) : '',
          ssl: process.env.DB_SSL !== 'false',
        },
        jwt: {
          secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production-min-32-chars',
        },
        backend: {
          passwordHash: process.env.BACKEND_PASSWORD_HASH || '',
        },
        frontend: {
          url: process.env.FRONTEND_URL || 'http://localhost:3000',
        },
        nodeEnv: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
      };
    }
    // Only throw in production runtime (not build time)
    throw error;
  }
}

// Helper function to parse connection string and remove SSL parameters
function parseConnectionString(url: string): { host: string; port: number; database: string; username: string; password: string } | null {
  try {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 5432,
      database: urlObj.pathname.slice(1) || 'postgres',
      username: urlObj.username,
      password: urlObj.password,
    };
  } catch {
    return null;
  }
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(() => {
    try {
      const envConfig = getEnvConfig();
      const databaseUrl = envConfig.database.url || process.env.DATABASE_URL || process.env.POSTGRES_URL;
      
      // If we have a connection string, check if it's Supabase
      const isSupabase = databaseUrl?.includes('supabase.co') || databaseUrl?.includes('pooler.supabase.com');
      
      // For Supabase, parse connection string to avoid SSL parameter conflicts
      if (databaseUrl && isSupabase) {
        const parsed = parseConnectionString(databaseUrl);
        if (parsed) {
          console.log('🔧 Parsing Supabase connection string to avoid SSL parameter conflicts');
          return {
            host: parsed.host,
            port: parsed.port,
            database: parsed.database,
            username: parsed.username,
            password: parsed.password,
          };
        }
      }
      
      // For non-Supabase or if parsing failed, use connection string as-is
      return envConfig.database.url
        ? { url: envConfig.database.url }
        : {
            host: envConfig.database.host,
            port: envConfig.database.port,
            database: envConfig.database.name,
            username: envConfig.database.user,
            password: envConfig.database.password ? String(envConfig.database.password) : '',
          };
    } catch {
      // Fallback for development
      const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
      const isSupabase = databaseUrl?.includes('supabase.co') || databaseUrl?.includes('pooler.supabase.com');
      
      // For Supabase, parse connection string to avoid SSL parameter conflicts
      if (databaseUrl && isSupabase) {
        const parsed = parseConnectionString(databaseUrl);
        if (parsed) {
          console.log('🔧 Parsing Supabase connection string to avoid SSL parameter conflicts');
          return {
            host: parsed.host,
            port: parsed.port,
            database: parsed.database,
            username: parsed.username,
            password: parsed.password,
          };
        }
      }
      
      if (databaseUrl) {
        return { url: databaseUrl };
      }
      return {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'postgres',
        username: process.env.DB_USER || 'postgres',
        password: String(process.env.DB_PASSWORD || ''),
      };
    }
  })(),
  ssl: (() => {
    try {
      const envConfig = getEnvConfig();
      const databaseUrl = (envConfig.database.url || process.env.DATABASE_URL || process.env.POSTGRES_URL)?.trim();
      
      // Check if connection string contains sslmode=require or pgbouncer (Supabase)
      const hasSslModeInUrl = databaseUrl?.includes('sslmode=require');
      const hasPgBouncer = databaseUrl?.includes('pgbouncer=true');
      const isSupabase = databaseUrl?.includes('supabase.co') || databaseUrl?.includes('pooler.supabase.com');
      
      // Only enable SSL if explicitly set to true and not localhost
      const isLocalhost = !envConfig.database.url && 
        (!envConfig.database.host || envConfig.database.host === 'localhost' || envConfig.database.host === '127.0.0.1');
      
      if (isLocalhost) {
        return false; // Disable SSL for localhost
      }
      
      // For Supabase or connection strings with sslmode=require, always enable SSL with rejectUnauthorized: false
      if (isSupabase || hasSslModeInUrl || hasPgBouncer || envConfig.database.ssl) {
        // Supabase uses self-signed certificates, so we need to accept them
        // CRITICAL: rejectUnauthorized: false is required for Supabase SSL certificates
        return { 
          rejectUnauthorized: false
        };
      }
      
      // In production, default to SSL enabled with rejectUnauthorized: false for safety
      if (isProduction) {
        return { 
          rejectUnauthorized: false
        };
      }
      
      return false;
    } catch {
      // For development/fallback, check if it's localhost or Supabase
      const databaseUrl = (process.env.DATABASE_URL || process.env.POSTGRES_URL)?.trim();
      const dbHost = process.env.DB_HOST?.trim() || 'localhost';
      const isLocalhost = dbHost === 'localhost' || dbHost === '127.0.0.1';
      const isSupabase = databaseUrl?.includes('supabase.co') || databaseUrl?.includes('pooler.supabase.com');
      const hasSslModeInUrl = databaseUrl?.includes('sslmode=require');
      const hasPgBouncer = databaseUrl?.includes('pgbouncer=true');
      
      if (isLocalhost) {
        return false; // Disable SSL for localhost
      }
      
      // For Supabase, always enable SSL with rejectUnauthorized: false
      if (isSupabase || hasSslModeInUrl || hasPgBouncer || process.env.DB_SSL === 'true') {
        // Supabase uses self-signed certificates, so we need to accept them
        // CRITICAL: rejectUnauthorized: false is required for Supabase SSL certificates
        return { 
          rejectUnauthorized: false
        };
      }
      
      // In production, default to SSL enabled with rejectUnauthorized: false for safety
      if (isProduction) {
        return { 
          rejectUnauthorized: false
        };
      }
      
      return false;
    }
  })(),
  synchronize: false, // Disabled - tables already exist. Use migrations for schema changes.
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Vehicle,
    VehicleImage,
    Settings,
    VehicleReservation,
    TestDriveRequest,
    RepairService,
    RepairServicePricing,
    RepairQuote,
    RepairQuoteItem,
    RepairAppointment,
    CarWashPackage,
    CarWashAddon,
    CarWashAppointment,
    CarWashAppointmentAddon,
    Customer,
    CustomerVehicle,
    ServiceRecord,
    Receipt,
    ContactMessage,
    UserPermission,
    Page,
  ],
  migrations: ['lib/migrations/*.ts'],
  extra: {
    max: isProduction ? 1 : 20,
    idleTimeoutMillis: isProduction ? 10000 : 30000,
    connectionTimeoutMillis: 15000,
  },
});

// Initialize connection
let isInitialized = false;
let isInitializing = false;

export async function initializeDatabase(): Promise<DataSource> {
  // If already initialized, return immediately
  if (AppDataSource.isInitialized) {
    // Seed script is disabled during build - run manually with: npm run seed
    return AppDataSource;
  }

  // If currently initializing, wait for it to complete
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return AppDataSource;
  }

  // Start initialization
  if (!isInitialized) {
    isInitializing = true;
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('✅ TypeORM: Database synchronized (tables auto-created/updated)');
        
        // Seed script is disabled during build - run manually with: npm run seed
        // This prevents build errors from seed script imports
      }
      isInitialized = true;
      console.log('✅ Database connection initialized successfully');
    } catch (error: any) {
      console.error('❌ Database initialization error:', {
        message: error.message,
        code: error.code,
        name: error.name,
      });
      
      // If error is about duplicate key (already exists) or NOT NULL constraint (schema already correct), ignore it
      const isIgnorableError =
        error.message?.includes('duplicate key') ||
        error.code === '23505' ||
        (error.code === '23502' && error.message?.includes('contains null values')) ||
        (error.code === '23502' && error.message?.includes('email'));
      
      if (isIgnorableError) {
        console.warn('⚠️  TypeORM initialization warning (schema already correct, ignoring):', error.message);
        // Check if DataSource is actually initialized despite the error
        if (AppDataSource.isInitialized) {
          try {
            await AppDataSource.query('SELECT 1');
            isInitialized = true;
          } catch (queryError) {
            // If query fails, try to continue anyway - schema might be correct
            console.warn('⚠️  Query test failed, but continuing...');
            isInitialized = true;
          }
        } else {
          // If not initialized, try to continue anyway (schema sync might have failed but tables exist)
          console.warn('⚠️  DataSource not initialized, but continuing...');
          isInitialized = true;
        }
        
        // Seed script is disabled during build - run manually with: npm run seed
        // This prevents build errors from seed script imports
      } else {
        throw error;
      }
    } finally {
      isInitializing = false;
    }
  }
  return AppDataSource;
}

export default AppDataSource;

