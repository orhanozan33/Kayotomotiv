import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { getPool } from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const createVehicleRecordSchema = Joi.object({
  vehicle_brand: Joi.string().required(),
  vehicle_model: Joi.string().required(),
  license_plate: Joi.string().allow('', null).optional(),
  selected_services: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      type: Joi.string().valid('package', 'addon').required(),
      name: Joi.string().required(),
      price: Joi.number().required(),
    })
  ).min(1).required(),
  total_price: Joi.number().required(),
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

    let query = `
      SELECT 
        rq.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'name', service->>'name',
              'price', (service->>'price')::numeric
            )
          )
          FROM json_array_elements(COALESCE(rq.services_data, '[]'::jsonb)::json) as service
          ), '[]'::json
        ) as parsed_services
      FROM repair_quotes rq
      WHERE rq.vehicle_brand IS NOT NULL
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (
        rq.vehicle_brand ILIKE $${paramCount} OR 
        rq.vehicle_model ILIKE $${paramCount} OR 
        rq.license_plate ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY rq.created_at DESC';

    const result = await getPool().query(query, params);

    const quotes = result.rows.map((row: any) => {
      let parsedServices: any[] = [];
      try {
        if (row.parsed_services && Array.isArray(row.parsed_services)) {
          parsedServices = row.parsed_services;
        } else if (row.services_data) {
          const servicesData = typeof row.services_data === 'string' 
            ? JSON.parse(row.services_data) 
            : row.services_data;
          
          if (Array.isArray(servicesData)) {
            parsedServices = servicesData;
          }
        }
      } catch (e) {
        console.error('Error parsing services:', e);
      }

      return {
        ...row,
        parsed_services: parsedServices,
      };
    });

    return NextResponse.json({ quotes });
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
    const { error, value } = createVehicleRecordSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const result = await getPool().query(
      `INSERT INTO repair_quotes 
       (vehicle_brand, vehicle_model, license_plate, services_data, total_price, status, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'completed', $6, NOW(), NOW())
       RETURNING *`,
      [
        value.vehicle_brand,
        value.vehicle_model,
        value.license_plate || null,
        JSON.stringify(value.selected_services),
        value.total_price,
        JSON.stringify({ license_plate: value.license_plate || '', services: value.selected_services }),
      ]
    );

    return NextResponse.json({ quote: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

