import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'quoted', 'accepted', 'rejected', 'completed').required(),
  notes: Joi.string().allow('', null).optional(),
  total_price: Joi.number().optional(),
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

    const updateFields: string[] = ['status = $1', 'updated_at = NOW()'];
    const updateValues: any[] = [value.status];
    let paramCount = 2;

    if (value.notes !== undefined) {
      updateFields.push(`notes = $${paramCount++}`);
      updateValues.push(value.notes || null);
    }

    if (value.total_price !== undefined) {
      updateFields.push(`total_price = $${paramCount++}`);
      updateValues.push(value.total_price);
    }

    updateValues.push(resolvedParams.id);

    const result = await pool.query(
      `UPDATE repair_quotes 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    return NextResponse.json({ quote: result.rows[0] });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

