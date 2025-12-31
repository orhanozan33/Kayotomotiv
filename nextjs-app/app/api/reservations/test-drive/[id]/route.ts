import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';

const isProduction = process.env.NODE_ENV === 'production';

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
      `DELETE FROM test_drive_requests 
       WHERE id = $1
       RETURNING *`,
      [resolvedParams.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Test drive request not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Test drive request deleted successfully' });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

