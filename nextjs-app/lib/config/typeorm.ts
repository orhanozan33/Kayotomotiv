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
  } catch (error) {
    // In development, return a minimal config
    if (process.env.NODE_ENV === 'development') {
      const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
      return {
        database: {
          url: databaseUrl,
          host: process.env.DB_HOST,
          port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
          name: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : '',
          ssl: process.env.DB_SSL !== 'false',
        },
      };
    }
    throw error;
  }
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(() => {
    try {
      const envConfig = getEnvConfig();
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
      // Only enable SSL if explicitly set to true and not localhost
      const isLocalhost = !envConfig.database.url && 
        (!envConfig.database.host || envConfig.database.host === 'localhost' || envConfig.database.host === '127.0.0.1');
      
      if (isLocalhost) {
        return false; // Disable SSL for localhost
      }
      
      return envConfig.database.ssl ? { rejectUnauthorized: false } : false;
    } catch {
      // For development/fallback, check if it's localhost
      const dbHost = process.env.DB_HOST || 'localhost';
      const isLocalhost = dbHost === 'localhost' || dbHost === '127.0.0.1';
      
      if (isLocalhost) {
        return false; // Disable SSL for localhost
      }
      
      return process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;
    }
  })(),
  synchronize: true, // Auto-create/update tables in all environments
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
let seedExecuted = false;

export async function initializeDatabase(): Promise<DataSource> {
  // If already initialized, return immediately
  if (AppDataSource.isInitialized) {
    // Run seed if not executed yet (for cases where DB was already initialized)
    if (!seedExecuted) {
      seedExecuted = true; // Set flag first to prevent re-entry
      try {
        const { seedDatabase } = await import('@/scripts/seed-data');
        await seedDatabase();
        console.log('✅ Seed data automatically added to database');
      } catch (error: any) {
        console.warn('⚠️  Seed data execution failed (non-critical):', error.message);
        seedExecuted = false; // Reset flag on error so it can retry
      }
    }
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
        
        // Run seed data after tables are created (only if not already executed)
        if (!seedExecuted) {
          seedExecuted = true; // Set flag first to prevent re-entry
          try {
            const { seedDatabase } = await import('@/scripts/seed-data');
            // Pass a flag to seedDatabase to skip its own initialization
            await seedDatabase();
            console.log('✅ Seed data automatically added to database');
          } catch (error: any) {
            console.warn('⚠️  Seed data execution failed (non-critical):', error.message);
            seedExecuted = false; // Reset flag on error so it can retry
          }
        }
      }
      isInitialized = true;
    } catch (error: any) {
      // If error is about duplicate key (already exists), ignore it
      if (error.message?.includes('duplicate key') || error.code === '23505') {
        console.warn('⚠️  TypeORM initialization warning (ignored):', error.message);
        // Try to check if connection is actually working
        try {
          await AppDataSource.query('SELECT 1');
          isInitialized = true;
          
          // Run seed data even if there was a warning
          if (!seedExecuted) {
            seedExecuted = true; // Set flag first to prevent re-entry
            try {
              const { seedDatabase } = await import('@/scripts/seed-data');
              await seedDatabase();
              console.log('✅ Seed data automatically added to database');
            } catch (seedError: any) {
              console.warn('⚠️  Seed data execution failed (non-critical):', seedError.message);
              seedExecuted = false; // Reset flag on error so it can retry
            }
          }
        } catch {
          // If query fails, re-throw original error
          throw error;
        }
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

