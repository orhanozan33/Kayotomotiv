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

    const result = await pool.query(
      'SELECT * FROM settings ORDER BY key'
    );

    const settings: any = {};
    result.rows.forEach((row: any) => {
      settings[row.key] = row.value;
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Settings object required' }, { status: 400 });
    }

    // Update or insert each setting
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) 
         DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, String(value)]
      );
    }

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

