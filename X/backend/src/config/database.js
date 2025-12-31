import dns from 'dns';
import dotenv from 'dotenv';
import pg from 'pg';

// Ensure .env is loaded even though `server.js` imports this file BEFORE calling dotenv.config()
dotenv.config();

// Prefer IPv4 addresses when a host resolves to both AAAA and A records.
// This avoids common serverless/DNS issues where IPv6 is returned first but not routable (e.g. Vercel IPv4).
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Older Node versions might not support this API; ignore safely.
}

const { Pool } = pg;

function isTruthy(value) {
  return value === true || value === 'true' || value === '1' || value === 1;
}

const isServerless = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

// Support either a single DATABASE_URL (recommended for pooler) or discrete DB_* variables.
// If you use Supabase Session Pooler, your connection string usually looks like:
// postgresql://postgres:[PASSWORD]@db.<ref>.supabase.co:6543/postgres?pgbouncer=true
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;

// IMPORTANT: DB connection details must come ONLY from environment variables.
// No hard-coded defaults are allowed.
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const missingDb = [];
if (!connectionString) {
  if (!dbHost) missingDb.push('DB_HOST');
  if (!dbPort || Number.isNaN(dbPort)) missingDb.push('DB_PORT');
  if (!dbName) missingDb.push('DB_NAME');
  if (!dbUser) missingDb.push('DB_USER');
  if (!dbPassword) missingDb.push('DB_PASSWORD');
}
if (missingDb.length > 0) {
  throw new Error(
    `Database config missing env vars: ${missingDb.join(', ')}. ` +
      `Set either DATABASE_URL/POSTGRES_URL or the full DB_* set in your environment.`
  );
}

// Supabase requires SSL for Postgres connections (both direct and pooler).
// Default to SSL enabled unless explicitly disabled via DB_SSL=false.
const sslEnabled = process.env.DB_SSL === undefined ? true : isTruthy(process.env.DB_SSL);

const poolConfig = {
  ...(connectionString
    ? { connectionString }
    : {
        host: dbHost,
        port: dbPort,
        database: dbName,
        user: dbUser,
        password: dbPassword,
      }),
  // In serverless environments, keep pool size small to avoid exhausting DB connections.
  max: isServerless ? Number(process.env.DB_POOL_MAX || 1) : Number(process.env.DB_POOL_MAX || 20),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || (isServerless ? 10000 : 30000)),
  connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT_MS || 15000),
  // Avoid noisy prepared statement issues when using pgBouncer/poolers.
  // (If your DATABASE_URL includes pgbouncer=true, Supabase expects pooler semantics.)
  statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS || 0),
  query_timeout: Number(process.env.DB_QUERY_TIMEOUT_MS || 0),
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
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
  ssl: poolConfig.ssl ? 'Enabled' : 'Disabled',
  poolMax: poolConfig.max,
  isServerless,
  dns: 'ipv4first',
});

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', {
    message: err.message,
    code: err.code,
  });
});

export default pool;
