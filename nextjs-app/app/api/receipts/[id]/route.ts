import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';

const isProduction = process.env.NODE_ENV === 'production';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const resolvedParams = await Promise.resolve(params);
    const result = await pool.query(
      'SELECT * FROM receipts WHERE id = $1',
      [resolvedParams.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    return NextResponse.json({ receipt: result.rows[0] });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const resolvedParams = await Promise.resolve(params);
    const result = await pool.query(
      `DELETE FROM receipts 
       WHERE id = $1
       RETURNING *`,
      [resolvedParams.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Receipt deleted successfully' });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

