import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { getPool } from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const updateCustomerSchema = Joi.object({
  first_name: Joi.string().optional(),
  last_name: Joi.string().optional(),
  email: Joi.string().email().allow('', null).optional(),
  phone: Joi.string().allow('', null).optional(),
  address: Joi.string().allow('', null).optional(),
  vehicle_brand: Joi.string().allow('', null).optional(),
  vehicle_model: Joi.string().allow('', null).optional(),
  vehicle_year: Joi.number().allow(null).optional(),
  license_plate: Joi.string().allow('', null).optional(),
  notes: Joi.string().allow('', null).optional(),
});

export async function GET(
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
    const customerResult = await getPool().query(
      'SELECT * FROM customers WHERE id = $1',
      [resolvedParams.id]
    );

    if (customerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customer = customerResult.rows[0];

    // Get vehicles
    const vehiclesResult = await getPool().query(
      'SELECT * FROM customer_vehicles WHERE customer_id = $1 ORDER BY created_at DESC',
      [resolvedParams.id]
    );

    // Get service records
    let serviceRecords: any[] = [];
    let stats: {
      total_services: number | string;
      total_spent: number | string;
      first_service: any;
      last_service: any;
    } = {
      total_services: 0,
      total_spent: 0,
      first_service: null,
      last_service: null,
    };

    try {
      const serviceRecordsResult = await getPool().query(
        'SELECT * FROM service_records WHERE customer_id = $1 ORDER BY performed_date DESC',
        [resolvedParams.id]
      );
      serviceRecords = serviceRecordsResult.rows;

      // Calculate stats
      const statsResult = await getPool().query(
        `SELECT 
          COUNT(*) as total_services,
          COALESCE(SUM(price), 0) as total_spent,
          MIN(performed_date) as first_service,
          MAX(performed_date) as last_service
         FROM service_records 
         WHERE customer_id = $1`,
        [resolvedParams.id]
      );
      
      if (statsResult.rows.length > 0) {
        stats = {
          total_services: statsResult.rows[0].total_services || 0,
          total_spent: statsResult.rows[0].total_spent || 0,
          first_service: statsResult.rows[0].first_service || null,
          last_service: statsResult.rows[0].last_service || null,
        };
      }
    } catch (error) {
      console.warn('Error loading service records:', error);
      // Continue without service records if table doesn't exist
    }

    return NextResponse.json({
      customer: {
        ...customer,
        vehicles: vehiclesResult.rows,
        serviceRecords: serviceRecords,
        stats: {
          total_services: parseInt(String(stats.total_services || 0)),
          total_spent: parseFloat(String(stats.total_spent || 0)),
          first_service: stats.first_service,
          last_service: stats.last_service,
        },
      },
    });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

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
    const { error, value } = updateCustomerSchema.validate(body);
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

    const result = await getPool().query(
      `UPDATE customers 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ customer: result.rows[0] });
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
    const result = await getPool().query(
      `DELETE FROM customers 
       WHERE id = $1
       RETURNING *`,
      [resolvedParams.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

