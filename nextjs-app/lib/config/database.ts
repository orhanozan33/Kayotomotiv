import dns from 'dns';
import { Pool, PoolConfig } from 'pg';

// Prefer IPv4 addresses when a host resolves to both AAAA and A records.
// This avoids common serverless/DNS issues where IPv6 is returned first but not routable.
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Older Node versions might not support this API; ignore safely.
}

function isTruthy(value: unknown): boolean {
  return value === true || value === 'true' || value === '1' || value === 1;
}

// Check if running in production/serverless environment
const isProduction = process.env.NODE_ENV === 'production';

// Support either a single DATABASE_URL (recommended for pooler) or discrete DB_* variables.
// Trim whitespace to handle Windows line endings
const connectionString = (process.env.DATABASE_URL || process.env.POSTGRES_URL)?.trim() || undefined;

// IMPORTANT: DB connection details must come ONLY from environment variables.
// No hard-coded defaults are allowed.
// Trim whitespace from environment variables (handles Windows line endings)
const dbHost = process.env.DB_HOST?.trim();
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT.trim()) : undefined;
const dbName = process.env.DB_NAME?.trim();
const dbUser = process.env.DB_USER?.trim();
const dbPassword = process.env.DB_PASSWORD?.trim();

// Check if we're in build time (Next.js build process)
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.NEXT_PHASE === 'phase-development-build' ||
                    (!process.env.VERCEL && process.env.NODE_ENV === 'production');

const missingDb: string[] = [];
if (!connectionString) {
  if (!dbHost) missingDb.push('DB_HOST');
  if (!dbPort || Number.isNaN(dbPort)) missingDb.push('DB_PORT');
  if (!dbName) missingDb.push('DB_NAME');
  if (!dbUser) missingDb.push('DB_USER');
  if (!dbPassword) missingDb.push('DB_PASSWORD');
}

// Only throw error if not in build time
if (missingDb.length > 0 && !isBuildTime) {
  throw new Error(
    `Database config missing env vars: ${missingDb.join(', ')}. ` +
      `Set either DATABASE_URL/POSTGRES_URL or the full DB_* set in your environment.`
  );
}

// During build time, create a minimal pool config that won't be used
if (isBuildTime && missingDb.length > 0) {
  console.warn('⚠️  Build time: Database config missing. Will be validated at runtime.');
}

// Default to SSL enabled unless explicitly disabled via DB_SSL=false.
// If DATABASE_URL contains sslmode=require, force SSL
// Also check for pgbouncer mode (connection pooler)
const hasSslModeInUrl = connectionString?.includes('sslmode=require');
const hasPgBouncer = connectionString?.includes('pgbouncer=true');
const isSupabase = connectionString?.includes('supabase.co') || connectionString?.includes('supabase.in');

// Determine if SSL should be enabled
// Check if it's localhost (either in connectionString or dbHost)
const isLocalhost = connectionString 
  ? (connectionString.includes('localhost') || connectionString.includes('127.0.0.1'))
  : (dbHost && (dbHost === 'localhost' || dbHost === '127.0.0.1'));

// For localhost, disable SSL. For Supabase/production, always enable SSL. Otherwise use DB_SSL setting.
const sslEnabled = isLocalhost 
  ? false 
  : (hasSslModeInUrl || hasPgBouncer || isSupabase || isProduction ? true : (process.env.DB_SSL === undefined ? true : isTruthy(process.env.DB_SSL)));

// Create pool config - use minimal config during build time if env vars are missing
const poolConfig: PoolConfig = isBuildTime && missingDb.length > 0
  ? {
      // Minimal config for build time - won't be used
      connectionString: connectionString || 'postgresql://localhost:5432/postgres',
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 15000,
      ssl: false,
    }
  : {
      ...(connectionString
        ? { connectionString }
        : {
            host: dbHost!,
            port: dbPort!,
            database: dbName!,
            user: dbUser!,
            password: dbPassword!,
          }),
      // In production environments, keep pool size small to avoid exhausting DB connections.
      max: isProduction ? Number(process.env.DB_POOL_MAX || 1) : Number(process.env.DB_POOL_MAX || 20),
      idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || (isProduction ? 10000 : 30000)),
      connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT_MS || (isProduction ? 30000 : 15000)), // Vercel için daha uzun timeout
      // Avoid noisy prepared statement issues when using pgBouncer/poolers.
      statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS || 0),
      query_timeout: Number(process.env.DB_QUERY_TIMEOUT_MS || 0),
      // SSL configuration: For Supabase and production, always use SSL with rejectUnauthorized: false
      // This allows self-signed certificates from Supabase
      ssl: sslEnabled ? { 
        rejectUnauthorized: false
      } : false,
      keepAlive: true,
    };

// Debug: Connection config'i logla (password hariç)
console.log('🔍 Database Connection Config:', {
  hasConnectionString: Boolean(connectionString),
  host: connectionString ? '[from DATABASE_URL]' : poolConfig.host,
  port: connectionString ? '[from DATABASE_URL]' : poolConfig.port,
  database: connectionString ? '[from DATABASE_URL]' : poolConfig.database,
  user: connectionString ? '[from DATABASE_URL]' : poolConfig.user,
  password: dbPassword ? '[SET]' : '[NOT SET]',
  ssl: poolConfig.ssl ? (typeof poolConfig.ssl === 'object' ? `Enabled (rejectUnauthorized: ${poolConfig.ssl.rejectUnauthorized})` : 'Enabled') : 'Disabled',
  isSupabase,
  isLocalhost,
  hasSslModeInUrl,
  hasPgBouncer,
  poolMax: poolConfig.max,
  isProduction,
  isVercel: Boolean(process.env.VERCEL),
  connectionTimeout: poolConfig.connectionTimeoutMillis,
  dns: 'ipv4first',
  // Connection string'in ilk 50 karakterini göster (password hariç)
  connectionStringPreview: connectionString ? connectionString.substring(0, 50) + '...' : 'N/A',
});

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err: any) => {
  console.error('❌ Unexpected error on idle client', {
    message: err.message,
    code: err.code,
  });
});

// Export function to get pool instance
export function getPool(): Pool {
  return pool;
}

export default pool;
