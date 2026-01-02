import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { getPool } from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const addServiceRecordSchema = Joi.object({
  service_name: Joi.string().required(),
  service_description: Joi.string().allow('', null).optional(),
  service_type: Joi.string().valid('repair', 'car_wash', 'maintenance', 'other').default('other'),
  price: Joi.number().required(),
  performed_date: Joi.string().required(),
  vehicle_id: Joi.string().uuid().allow(null).optional(),
});

export async function POST(
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
    const { error, value } = addServiceRecordSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const result = await getPool().query(
      `INSERT INTO service_records 
       (customer_id, vehicle_id, service_name, service_description, service_type, price, performed_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        resolvedParams.id,
        value.vehicle_id || null,
        value.service_name,
        value.service_description || null,
        value.service_type || 'other',
        value.price,
        value.performed_date,
      ]
    );

    return NextResponse.json({ serviceRecord: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

