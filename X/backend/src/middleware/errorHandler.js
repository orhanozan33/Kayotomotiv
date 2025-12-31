export const errorHandler = (err, req, res, next) => {
  // Production'da hassas bilgileri logla ama kullanıcıya gösterme
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Production'da sadece genel hataları logla
    console.error('Error:', {
      message: err.message,
      code: err.code,
      statusCode: err.statusCode || 500,
      path: req.path,
      method: req.method
    });
  } else {
    // Development'ta tüm detayları göster
    console.error('Error:', err);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      ...(isProduction ? {} : { details: err.message })
    });
  }

  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      error: 'Duplicate entry',
      details: isProduction ? 'This record already exists' : err.detail
    });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({
      error: 'Invalid reference',
      details: isProduction ? 'Referenced record does not exist' : err.detail
    });
  }

  // Table does not exist error (42P01)
  if (err.code === '42P01' || (err.message && err.message.includes('does not exist'))) {
    return res.status(500).json({
      error: 'Database schema not initialized',
      message: 'Please run database migrations first',
      ...(isProduction ? {} : { details: err.message })
    });
  }

  // Connection errors
  const isConnectionError =
    err.code === 'ECONNREFUSED' ||
    err.code === 'ENOTFOUND' ||
    err.code === 'EAI_AGAIN' ||
    err.code === 'ETIMEDOUT' ||
    err.code === 'ENETUNREACH' ||
    err.message?.includes('connection') ||
    err.message?.includes('getaddrinfo');

  if (isConnectionError) {
    const host = process.env.DB_HOST || '[not set]';
    const port = process.env.DB_PORT || '[not set]';
    const hasDatabaseUrl = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);

    return res.status(500).json({
      error: 'Database connection failed',
      message: 'Unable to connect to Supabase database.',
      details: hasDatabaseUrl
        ? 'Check DATABASE_URL / POSTGRES_URL connection string (host/port/password/ssl). If using pooler, ensure pgbouncer=true and SSL is enabled.'
        : `Check DB_* settings (DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD) and SSL. Current: DB_HOST=${host}, DB_PORT=${port}.`,
      ...(isProduction ? {} : { 
        stack: err.stack,
        code: err.code,
        hint: 'If DNS returns IPv6 first and your runtime is IPv4-only, prefer IPv4 (code sets dns.setDefaultResultOrder("ipv4first") in database config).'
      })
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }

  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS policy violation'
    });
  }

  // Default error - Production'da da bazı hataları detaylı göster
  const statusCode = err.statusCode || 500;
  
  // Önemli hataları production'da da detaylı göster
  const showDetails = !isProduction || 
    err.message?.includes('Database') || 
    err.message?.includes('JWT_SECRET') ||
    err.message?.includes('connection') ||
    err.code === '42P01' ||
    err.code === 'ECONNREFUSED' ||
    err.code === 'ENOTFOUND';
  
  const message = isProduction && !showDetails
    ? (statusCode === 500 ? 'Internal server error' : err.message)
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(showDetails ? { code: err.code, details: err.message } : {}),
    ...(isProduction ? {} : { stack: err.stack })
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
};


