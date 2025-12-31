import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const updateServiceRecordSchema = Joi.object({
  service_name: Joi.string().optional(),
  service_description: Joi.string().allow('', null).optional(),
  service_type: Joi.string().valid('repair', 'car_wash', 'maintenance', 'other').optional(),
  price: Joi.number().optional(),
  performed_date: Joi.string().optional(),
  vehicle_id: Joi.string().uuid().allow(null).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; serviceRecordId: string }> | { id: string; serviceRecordId: string } }
) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const resolvedParams = await Promise.resolve(params);
    const body = await request.json();
    const { error, value } = updateServiceRecordSchema.validate(body);
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

    updateValues.push(resolvedParams.serviceRecordId);
    updateFields.push(`updated_at = NOW()`);

    const result = await pool.query(
      `UPDATE service_records 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount} AND customer_id = $${paramCount + 1}
       RETURNING *`,
      [...updateValues, resolvedParams.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Service record not found' }, { status: 404 });
    }

    return NextResponse.json({ serviceRecord: result.rows[0] });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; serviceRecordId: string }> | { id: string; serviceRecordId: string } }
) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const resolvedParams = await Promise.resolve(params);
    const result = await pool.query(
      `DELETE FROM service_records 
       WHERE id = $1 AND customer_id = $2
       RETURNING *`,
      [resolvedParams.serviceRecordId, resolvedParams.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Service record not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Service record deleted successfully' });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

