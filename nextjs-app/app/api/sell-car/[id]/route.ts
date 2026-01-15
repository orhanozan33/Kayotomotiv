import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { getPool } from '@/lib/config/database';
import { authenticate, requireAdmin } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';

const isProduction = process.env.NODE_ENV === 'production';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const result = await getPool().query(
      'SELECT * FROM sell_car_submissions WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ submission: result.rows[0] });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const body = await request.json();
    const { status } = body;

    const result = await getPool().query(
      `UPDATE sell_car_submissions 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ submission: result.rows[0] });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const result = await getPool().query(
      'DELETE FROM sell_car_submissions WHERE id = $1 RETURNING *',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Submission deleted successfully' });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}
