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

  // Default error
  const statusCode = err.statusCode || 500;
  const message = isProduction 
    ? (statusCode === 500 ? 'Internal server error' : err.message)
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(isProduction ? {} : { stack: err.stack })
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
};


