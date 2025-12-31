/**
 * Centralized environment variable configuration with TypeScript types
 * All environment variables should be accessed through this module
 */

interface EnvConfig {
  // Database
  database: {
    url?: string;
    host?: string;
    port?: number;
    name?: string;
    user?: string;
    password?: string;
    ssl: boolean;
  };
  // JWT
  jwt: {
    secret: string;
  };
  // Backend Auth
  backend: {
    passwordHash: string;
  };
  // Frontend
  frontend: {
    url: string;
  };
  // Node
  nodeEnv: 'development' | 'production' | 'test';
}

function getEnvConfig(): EnvConfig {
  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvConfig['nodeEnv'];

  // Database
  // Trim whitespace from environment variables (handles Windows line endings)
  const databaseUrl = (process.env.DATABASE_URL || process.env.POSTGRES_URL)?.trim();
  const dbHost = process.env.DB_HOST?.trim();
  const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT.trim()) : undefined;
  const dbName = process.env.DB_NAME?.trim();
  const dbUser = process.env.DB_USER?.trim();
  const dbPassword = process.env.DB_PASSWORD?.trim();

  // Validate database config
  if (!databaseUrl && (!dbHost || !dbPort || !dbName || !dbUser || !dbPassword)) {
    throw new Error(
      'Database configuration missing. Set either DATABASE_URL/POSTGRES_URL or all DB_* variables.'
    );
  }

  // JWT
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // Backend
  const backendPasswordHash = process.env.BACKEND_PASSWORD_HASH;
  if (!backendPasswordHash) {
    throw new Error('BACKEND_PASSWORD_HASH is required');
  }

  // Frontend
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  return {
    database: {
      url: databaseUrl,
      host: dbHost,
      port: dbPort,
      name: dbName,
      user: dbUser,
      password: dbPassword,
      ssl: process.env.DB_SSL !== 'false',
    },
    jwt: {
      secret: jwtSecret,
    },
    backend: {
      passwordHash: backendPasswordHash,
    },
    frontend: {
      url: frontendUrl,
    },
    nodeEnv,
  };
}

// Validate on import
// Note: In development, we allow the app to start even if some env vars are missing
// but they will be required when actually used
let envConfig: EnvConfig;
try {
  envConfig = getEnvConfig();
} catch (error: any) {
  console.error('❌ Environment configuration error:', error.message);
  // In production, fail fast
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
  // In development, create a minimal config with defaults
  console.warn('⚠️  Continuing in development mode with minimal config');
  const databaseUrl = (process.env.DATABASE_URL || process.env.POSTGRES_URL)?.trim();
  envConfig = {
    database: {
      url: databaseUrl,
      host: process.env.DB_HOST?.trim(),
      port: process.env.DB_PORT ? Number(process.env.DB_PORT.trim()) : undefined,
      name: process.env.DB_NAME?.trim(),
      user: process.env.DB_USER?.trim(),
      password: process.env.DB_PASSWORD?.trim(),
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
    nodeEnv: (process.env.NODE_ENV || 'development') as EnvConfig['nodeEnv'],
  };
}

export default envConfig;
export { type EnvConfig };

