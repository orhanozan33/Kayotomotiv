import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const updateServiceSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().allow('', null).optional(),
  category: Joi.string().allow('', null).optional(),
  base_price: Joi.number().optional(),
  display_order: Joi.number().optional(),
  is_active: Joi.boolean().optional(),
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
    const { error, value } = updateServiceSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    Object.keys(value).forEach((key) => {
      updateFields.push(`${key} = $${paramCount++}`);
      updateValues.push(value[key]);
    });

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateValues.push(resolvedParams.id);
    updateFields.push(`updated_at = NOW()`);

    const result = await pool.query(
      `UPDATE repair_services 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ service: result.rows[0] });
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
      `DELETE FROM repair_services 
       WHERE id = $1
       RETURNING *`,
      [resolvedParams.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

