import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { getPool } from '@/lib/config/database';
import { authenticate, requireAdmin } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const createContactMessageSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('', null).optional(),
  subject: Joi.string().required(),
  message: Joi.string().required(),
});

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const body = await request.json();

    const { error, value } = createContactMessageSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const result = await getPool().query(
      `INSERT INTO contact_messages (name, email, phone, subject, message, status)
       VALUES ($1, $2, $3, $4, $5, 'unread')
       RETURNING *`,
      [value.name, value.email, value.phone || null, value.subject, value.message]
    );

    return NextResponse.json({ message: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = 'SELECT * FROM contact_messages WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (status && status !== 'all') {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await getPool().query(query, params);

    // Count total messages
    const totalResult = await getPool().query('SELECT COUNT(*) as total FROM contact_messages');
    const total = parseInt(totalResult.rows[0].total);

    return NextResponse.json({ messages: result.rows, total });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

