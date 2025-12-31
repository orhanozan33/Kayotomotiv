import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const createTestDriveSchema = Joi.object({
  vehicle_id: Joi.string().uuid().required(),
  customer_name: Joi.string().required(),
  customer_email: Joi.string().email().required(),
  customer_phone: Joi.string().required(),
  message: Joi.string().allow('', null).optional(),
  preferred_date: Joi.string().allow('', null).optional(),
  preferred_time: Joi.string().allow('', null).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const body = await request.json();

    const { error, value } = createTestDriveSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const authResult = await authenticate(request);
    const userId = authResult.user?.id || null;

    const result = await pool.query(
      `INSERT INTO test_drive_requests 
       (vehicle_id, user_id, customer_name, customer_email, customer_phone, message, preferred_date, preferred_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        value.vehicle_id,
        userId,
        value.customer_name,
        value.customer_email,
        value.customer_phone,
        value.message || null,
        value.preferred_date || null,
        value.preferred_time || null,
      ]
    );

    return NextResponse.json({ testDrive: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const result = await pool.query(
      `SELECT tdr.*, v.brand, v.model, v.year
       FROM test_drive_requests tdr
       JOIN auto_sales v ON tdr.vehicle_id = v.id
       WHERE ${authResult.user!.role === 'admin' ? '1=1' : 'tdr.user_id = $1'}
       ORDER BY tdr.created_at DESC`,
      authResult.user!.role === 'admin' ? [] : [authResult.user!.id]
    );

    return NextResponse.json({ testDrives: result.rows });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

