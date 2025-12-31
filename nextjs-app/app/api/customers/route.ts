import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const createCustomerSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().allow('', null).optional(),
  phone: Joi.string().allow('', null).optional(),
  address: Joi.string().allow('', null).optional(),
  vehicle_brand: Joi.string().allow('', null).optional(),
  vehicle_model: Joi.string().allow('', null).optional(),
  vehicle_year: Joi.number().allow(null).optional(),
  license_plate: Joi.string().allow('', null).optional(),
  notes: Joi.string().allow('', null).optional(),
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

    let query = 'SELECT * FROM customers WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (
        first_name ILIKE $${paramCount} OR 
        last_name ILIKE $${paramCount} OR 
        email ILIKE $${paramCount} OR 
        phone ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    // Calculate total_spent for each customer
    const customers = await Promise.all(
      result.rows.map(async (customer: any) => {
        try {
          const serviceResult = await pool.query(
            'SELECT COALESCE(SUM(price), 0) as total FROM service_records WHERE customer_id = $1',
            [customer.id]
          );
          return {
            ...customer,
            total_spent: parseFloat(serviceResult.rows[0].total || 0),
          };
        } catch (error) {
          // If service_records table doesn't exist, return 0
          console.warn('Error calculating total_spent:', error);
          return {
            ...customer,
            total_spent: 0,
          };
        }
      })
    );

    return NextResponse.json({ customers });
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
    const { error, value } = createCustomerSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO customers 
       (first_name, last_name, email, phone, address, vehicle_brand, vehicle_model, vehicle_year, license_plate, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [
        value.first_name,
        value.last_name,
        value.email || null,
        value.phone || null,
        value.address || null,
        value.vehicle_brand || null,
        value.vehicle_model || null,
        value.vehicle_year || null,
        value.license_plate || null,
        value.notes || null,
      ]
    );

    return NextResponse.json({ customer: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

