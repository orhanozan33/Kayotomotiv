import { NextResponse } from 'next/server';

export function handleError(error: any, isProduction: boolean = false): NextResponse {
  if (isProduction) {
    console.error('Error:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode || 500,
    });
  } else {
    console.error('Error:', error);
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return NextResponse.json(
      {
        error: 'Validation error',
        ...(isProduction ? {} : { details: error.message }),
      },
      { status: 400 }
    );
  }

  // Database errors
  if (error.code === '23505') {
    // Unique violation
    return NextResponse.json(
      {
        error: 'Duplicate entry',
        details: isProduction ? 'This record already exists' : error.detail,
      },
      { status: 409 }
    );
  }

  if (error.code === '23503') {
    // Foreign key violation
    return NextResponse.json(
      {
        error: 'Invalid reference',
        details: isProduction ? 'Referenced record does not exist' : error.detail,
      },
      { status: 400 }
    );
  }

  // Table does not exist error (42P01)
  if (error.code === '42P01' || (error.message && error.message.includes('does not exist'))) {
    return NextResponse.json(
      {
        error: 'Database schema not initialized',
        message: 'Please run database migrations first',
        ...(isProduction ? {} : { details: error.message }),
      },
      { status: 500 }
    );
  }

  // Connection errors
  const isConnectionError =
    error.code === 'ECONNREFUSED' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'EAI_AGAIN' ||
    error.code === 'ETIMEDOUT' ||
    error.code === 'ENETUNREACH' ||
    error.message?.includes('connection') ||
    error.message?.includes('getaddrinfo');

  if (isConnectionError) {
    const hasDatabaseUrl = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);

    return NextResponse.json(
      {
        error: 'Database connection failed',
        message: 'Unable to connect to database.',
        details: hasDatabaseUrl
          ? 'Check DATABASE_URL / POSTGRES_URL connection string (host/port/password/ssl). If using pooler, ensure pgbouncer=true and SSL is enabled.'
          : 'Check DB_* settings (DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD) and SSL.',
        ...(isProduction ? {} : { stack: error.stack, code: error.code }),
      },
      { status: 500 }
    );
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // CORS errors
  if (error.message && error.message.includes('CORS')) {
    return NextResponse.json({ error: 'CORS policy violation' }, { status: 403 });
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const showDetails =
    !isProduction ||
    error.message?.includes('Database') ||
    error.message?.includes('JWT_SECRET') ||
    error.message?.includes('connection') ||
    error.code === '42P01' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ENOTFOUND';

  const message =
    isProduction && !showDetails
      ? statusCode === 500
        ? 'Internal server error'
        : error.message
      : error.message;

  return NextResponse.json(
    {
      error: message,
      ...(showDetails ? { code: error.code, details: error.message } : {}),
      ...(isProduction ? {} : { stack: error.stack }),
    },
    { status: statusCode }
  );
}

