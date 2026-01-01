import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { getPool } from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const createReceiptSchema = Joi.object({
  customer_id: Joi.string().uuid().allow(null).optional(),
  service_record_id: Joi.string().uuid().allow(null).optional(),
  customer_name: Joi.string().allow(null).optional(),
  customer_phone: Joi.string().allow(null).optional(),
  customer_email: Joi.string().email().allow(null).optional(),
  license_plate: Joi.string().allow(null).optional(),
  service_name: Joi.string().required(),
  service_description: Joi.string().allow(null).optional(),
  service_type: Joi.string().valid('repair', 'car_wash', 'maintenance', 'other').required(),
  price: Joi.number().required(),
  performed_date: Joi.string().required(),
  company_info: Joi.object().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = 'SELECT * FROM receipts WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (
        customer_name ILIKE $${paramCount} OR 
        customer_phone ILIKE $${paramCount} OR 
        license_plate ILIKE $${paramCount} OR
        service_name ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY performed_date DESC, created_at DESC';

    const result = await getPool().query(query, params);

    return NextResponse.json({ receipts: result.rows });
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
    const { error, value } = createReceiptSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const result = await getPool().query(
      `INSERT INTO receipts 
       (customer_id, service_record_id, customer_name, customer_phone, customer_email, license_plate, 
        service_name, service_description, service_type, price, performed_date, company_info, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       RETURNING *`,
      [
        value.customer_id || null,
        value.service_record_id || null,
        value.customer_name || null,
        value.customer_phone || null,
        value.customer_email || null,
        value.license_plate || null,
        value.service_name,
        value.service_description || null,
        value.service_type,
        value.price,
        value.performed_date,
        value.company_info ? JSON.stringify(value.company_info) : null,
      ]
    );

    return NextResponse.json({ receipt: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

