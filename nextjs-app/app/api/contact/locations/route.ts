import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { getPool } from '@/lib/config/database';
import { handleError } from '@/lib/middleware/errorHandler';

const isProduction = process.env.NODE_ENV === 'production';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();

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

    const result = await getPool().query(
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






