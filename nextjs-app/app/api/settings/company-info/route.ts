import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { getPool } from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';

const isProduction = process.env.NODE_ENV === 'production';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const keys = [
      'company_name',
      'company_tax_number',
      'company_address',
      'company_phone',
      'company_email',
    ];

    const result = await getPool().query(
      `SELECT key, value FROM settings WHERE key = ANY($1)`,
      [keys]
    );

    const companyInfo: any = {};
    result.rows.forEach((row: any) => {
      companyInfo[row.key] = row.value;
    });

    return NextResponse.json({ companyInfo });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

