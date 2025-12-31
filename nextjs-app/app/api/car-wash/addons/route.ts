import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const createAddonSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('', null).optional(),
  price: Joi.number().required(),
  display_order: Joi.number().default(0),
  is_active: Joi.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const result = await pool.query(
      "SELECT * FROM car_wash_addons WHERE is_active = true ORDER BY display_order, name"
    );
    return NextResponse.json({ addons: result.rows });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const body = await request.json();
    const { error, value } = createAddonSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO car_wash_addons (name, description, price, display_order, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [
        value.name,
        value.description || null,
        value.price,
        value.display_order || 0,
        value.is_active !== false,
      ]
    );

    return NextResponse.json({ addon: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

