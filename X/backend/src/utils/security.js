import path from 'path';
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Path traversal koruması ile güvenli dosya yolu oluşturur
 */
export function sanitizeFilePath(basePath, userPath) {
  // Path traversal karakterlerini temizle
  const normalizedPath = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, '');
  
  // Resolve ile absolute path'e çevir
  const resolvedPath = path.resolve(basePath, normalizedPath);
  
  // Base path içinde olduğundan emin ol
  if (!resolvedPath.startsWith(path.resolve(basePath))) {
    throw new Error('Yetkisiz dosya erişimi');
  }
  
  // Symlink kontrolü için gerçek yolu kontrol et
  return resolvedPath;
}

/**
 * SQL sorgusunu sanitize eder ve güvenlik kontrolleri yapar
 */
export function sanitizeSQLQuery(sql) {
  if (!sql || typeof sql !== 'string') {
    throw new Error('SQL sorgusu gerekli');
  }

  const trimmedSQL = sql.trim();
  
  // Boş sorgu kontrolü
  if (!trimmedSQL) {
    throw new Error('SQL sorgusu boş olamaz');
  }

  // Tek sorgu kontrolü (noktalı virgül ile ayrılmış birden fazla sorgu engellenmeli)
  const semicolonCount = (trimmedSQL.match(/;/g) || []).length;
  if (semicolonCount > 1 || (semicolonCount === 1 && !trimmedSQL.trim().endsWith(';'))) {
    throw new Error('Birden fazla SQL sorgusu çalıştırılamaz');
  }

  // SQL comment'leri temizle
  let cleanSQL = trimmedSQL;
  // Single line comments (--)
  cleanSQL = cleanSQL.replace(/--.*$/gm, '');
  // Multi-line comments (/* */)
  cleanSQL = cleanSQL.replace(/\/\*[\s\S]*?\*\//g, '');
  
  const sqlUpper = cleanSQL.trim().toUpperCase();
  const allowedCommands = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TRUNCATE'];
  const firstWord = sqlUpper.split(/\s+/)[0];
  
  if (!allowedCommands.includes(firstWord)) {
    throw new Error('İzin verilmeyen SQL komutu');
  }

  // Tehlikeli pattern'leri kontrol et
  const dangerousPatterns = [
    /DROP\s+DATABASE/gi,
    /DROP\s+TABLE/gi,
    /TRUNCATE/gi,
    /DELETE\s+FROM.*WHERE\s+1\s*=\s*1/gi,
    /UPDATE.*SET.*WHERE\s+1\s*=\s*1/gi,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(cleanSQL)) {
      throw new Error('Güvenlik nedeniyle bu SQL komutu çalıştırılamaz');
    }
  }

  return cleanSQL.trim();
}

/**
 * Backend şifresini hash'ler
 */
export async function hashBackendPassword(password) {
  return await bcrypt.hash(password, 12);
}

/**
 * Backend şifresini doğrular
 */
export async function verifyBackendPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Backend session token oluşturur
 */
export function generateBackendToken() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable gerekli');
  }
  
  return jwt.sign(
    { 
      type: 'backend_session',
      timestamp: Date.now()
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

/**
 * Backend token'ı doğrular
 */
export function verifyBackendToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable gerekli');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'backend_session') {
      throw new Error('Geçersiz token tipi');
    }
    return decoded;
  } catch (error) {
    throw new Error('Geçersiz token');
  }
}

/**
 * Environment variable kontrolü yapar
 */
export function validateEnvironmentVariables() {
  const required = [
    'JWT_SECRET',
    'BACKEND_PASSWORD_HASH'
  ];

  const missing = required.filter(key => !process.env[key]);

  // DB connection: allow either DATABASE_URL/POSTGRES_URL or full DB_* vars
  const hasDbUrl = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  if (!hasDbUrl) {
    const dbRequired = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const dbMissing = dbRequired.filter(key => !process.env[key]);
    if (dbMissing.length > 0) {
      missing.push(...dbMissing);
      missing.push('(or set DATABASE_URL/POSTGRES_URL instead of DB_* vars)');
    }
  }

  if (missing.length > 0) {
    throw new Error(`Eksik environment variable'lar: ${missing.join(', ')}`);
  }

  // JWT_SECRET minimum uzunluk kontrolü
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET en az 32 karakter olmalıdır');
  }
}

