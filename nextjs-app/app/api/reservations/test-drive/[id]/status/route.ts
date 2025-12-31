import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed').required(),
});

export async function PUT(
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
    const body = await request.json();
    const { error, value } = updateStatusSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE test_drive_requests 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [value.status, resolvedParams.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Test drive request not found' }, { status: 404 });
    }

    return NextResponse.json({ testDrive: result.rows[0] });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

