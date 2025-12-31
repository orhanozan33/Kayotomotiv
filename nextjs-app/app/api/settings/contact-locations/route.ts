import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
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
      'contact_location_1_name',
      'contact_location_1_address',
      'contact_location_1_phone',
      'contact_location_1_hours',
      'contact_location_2_name',
      'contact_location_2_address',
      'contact_location_2_phone',
      'contact_location_2_hours',
      'contact_location_3_name',
      'contact_location_3_address',
      'contact_location_3_phone',
      'contact_location_3_hours',
    ];

    const result = await pool.query(
      `SELECT key, value FROM settings WHERE key = ANY($1)`,
      [keys]
    );

    const locations = [
      {
        name: result.rows.find((r: any) => r.key === 'contact_location_1_name')?.value || '',
        address: result.rows.find((r: any) => r.key === 'contact_location_1_address')?.value || '',
        phone: result.rows.find((r: any) => r.key === 'contact_location_1_phone')?.value || '',
        hours: result.rows.find((r: any) => r.key === 'contact_location_1_hours')?.value || '',
      },
      {
        name: result.rows.find((r: any) => r.key === 'contact_location_2_name')?.value || '',
        address: result.rows.find((r: any) => r.key === 'contact_location_2_address')?.value || '',
        phone: result.rows.find((r: any) => r.key === 'contact_location_2_phone')?.value || '',
        hours: result.rows.find((r: any) => r.key === 'contact_location_2_hours')?.value || '',
      },
      {
        name: result.rows.find((r: any) => r.key === 'contact_location_3_name')?.value || '',
        address: result.rows.find((r: any) => r.key === 'contact_location_3_address')?.value || '',
        phone: result.rows.find((r: any) => r.key === 'contact_location_3_phone')?.value || '',
        hours: result.rows.find((r: any) => r.key === 'contact_location_3_hours')?.value || '',
      },
    ];

    return NextResponse.json({ locations });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

