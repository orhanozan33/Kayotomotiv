import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { getPool } from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const addVehicleSchema = Joi.object({
  brand: Joi.string().required(),
  model: Joi.string().required(),
  year: Joi.number().allow(null).optional(),
  license_plate: Joi.string().allow('', null).optional(),
  vin: Joi.string().allow('', null).optional(),
  color: Joi.string().allow('', null).optional(),
  mileage: Joi.number().allow(null).optional(),
  notes: Joi.string().allow('', null).optional(),
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
    const { error, value } = addVehicleSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const result = await getPool().query(
      `INSERT INTO customer_vehicles 
       (customer_id, brand, model, year, license_plate, vin, color, mileage, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        resolvedParams.id,
        value.brand,
        value.model,
        value.year || null,
        value.license_plate || null,
        value.vin || null,
        value.color || null,
        value.mileage || null,
        value.notes || null,
      ]
    );

    return NextResponse.json({ vehicle: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

