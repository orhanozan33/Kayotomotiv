import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
import { authenticate, requireAdmin } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { sanitizeSQLQuery } from '@/lib/utils/security';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const sqlQuerySchema = Joi.object({
  sql: Joi.string().required().min(1).max(10000),
});

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const body = await request.json();
    const { error, value } = sqlQuerySchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    // SQL sorgusunu sanitize et
    const sanitizedSQL = sanitizeSQLQuery(value.sql);

    // Güvenli SQL sorgusunu çalıştır
    const result = await pool.query({
      text: sanitizedSQL,
      rowMode: 'array', // Güvenlik için array modu
    });

    return NextResponse.json({
      command: result.command,
      rowCount: result.rowCount,
      rows: result.rows,
    });
  } catch (error: any) {
    // Güvenlik: Hata mesajlarını sanitize et
    const isSecurityError = error.message.includes('Yetkisiz') || 
                           error.message.includes('İzin verilmeyen') ||
                           error.message.includes('Güvenlik');
    
    return NextResponse.json({
      error: isSecurityError ? 'Güvenlik hatası' : 'SQL hatası',
      message: process.env.NODE_ENV === 'production' && !isSecurityError
        ? 'SQL sorgusu çalıştırılamadı'
        : error.message,
      ...(process.env.NODE_ENV !== 'production' && { detail: error.detail }),
    }, { status: isSecurityError ? 403 : 500 });
  }
}

