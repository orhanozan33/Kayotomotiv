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
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.message?.includes('connection') || err.message?.includes('getaddrinfo')) {
    return res.status(500).json({
      error: 'Database connection failed',
      message: 'Unable to connect to Supabase database.',
      details: `Check Supabase connection settings. Host: db.rxbtkjihvqjmamdwmsev.supabase.co, Port: 6543 (Session Pooler) or use Supabase REST API`,
      ...(isProduction ? {} : { 
        stack: err.stack,
        code: err.code,
        supabaseConfig: {
          host: 'db.rxbtkjihvqjmamdwmsev.supabase.co',
          port: 6543,
          database: 'postgres',
          user: 'postgres',
          note: 'Direkt Supabase bağlantısı kullanılıyor - Session Pooler (IPv4 uyumlu). Alternatif: Supabase REST API'
        }
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


