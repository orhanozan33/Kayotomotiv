import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { getPool } from '@/lib/config/database';
import { authenticate, requireAdmin } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const createRepairQuoteSchema = Joi.object({
  vehicle_brand: Joi.string().required(),
  vehicle_model: Joi.string().required(),
  vehicle_year: Joi.string().required(),
  customer_name: Joi.string().required(),
  customer_email: Joi.string().email().required(),
  customer_phone: Joi.string().required(),
  services: Joi.array()
    .items(
      Joi.object({
        service_id: Joi.string().uuid().required(),
        price: Joi.number().required(),
        quantity: Joi.number().integer().min(1).default(1),
      })
    )
    .min(1)
    .required(),
});

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const body = await request.json();

    const { error, value } = createRepairQuoteSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const result = await getPool().query(
      `INSERT INTO repair_quotes 
       (vehicle_brand, vehicle_model, vehicle_year, customer_name, customer_email, customer_phone, services_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        value.vehicle_brand,
        value.vehicle_model,
        value.vehicle_year,
        value.customer_name,
        value.customer_email,
        value.customer_phone,
        JSON.stringify(value.services),
      ]
    );

    return NextResponse.json({ quote: result.rows[0] }, { status: 201 });
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

    let query = 'SELECT * FROM repair_quotes WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await getPool().query(query, params);

    const quotes = result.rows.map((quote: any) => {
      let parsedServices: any[] = [];
      try {
        if (quote.services_data) {
          const servicesData = typeof quote.services_data === 'string' 
            ? JSON.parse(quote.services_data) 
            : quote.services_data;
          
          if (Array.isArray(servicesData)) {
            parsedServices = servicesData;
          } else if (quote.notes) {
            // Try to parse from notes if services_data is not available
            try {
              const notesData = JSON.parse(quote.notes);
              if (notesData.services && Array.isArray(notesData.services)) {
                parsedServices = notesData.services;
              }
            } catch (e) {
              // If notes is not JSON, treat it as a single service description
              parsedServices = [{ name: quote.notes, price: quote.total_price || 0 }];
            }
          }
        }
      } catch (e) {
        console.error('Error parsing services:', e);
      }

      return {
        ...quote,
        parsed_services: parsedServices,
      };
    });

    return NextResponse.json({ quotes });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

