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
        cwr.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'name', service->>'name',
              'price', (service->>'price')::numeric
            )
          )
          FROM json_array_elements(COALESCE(cwr.services_data, '[]'::jsonb)::json) as service
          ), '[]'::json
        ) as parsed_services
      FROM car_wash_records cwr
      WHERE cwr.vehicle_brand IS NOT NULL
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (
        cwr.vehicle_brand ILIKE $${paramCount} OR 
        cwr.vehicle_model ILIKE $${paramCount} OR 
        cwr.license_plate ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY cwr.created_at DESC';

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
    
    // Ensure car_wash_records table exists
    try {
      await getPool().query('SELECT 1 FROM car_wash_records LIMIT 1');
    } catch (tableError: any) {
      // If table doesn't exist (42P01), create it
      if (tableError.code === '42P01') {
        try {
          // Try gen_random_uuid() first (PostgreSQL 13+)
          await getPool().query(`
            CREATE TABLE IF NOT EXISTS car_wash_records (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID,
              customer_id UUID,
              customer_name VARCHAR(200),
              customer_email VARCHAR(255),
              customer_phone VARCHAR(20),
              vehicle_brand VARCHAR(100),
              vehicle_model VARCHAR(100),
              vehicle_year INTEGER,
              license_plate VARCHAR(20),
              services_data JSONB,
              total_price DECIMAL(10, 2),
              status VARCHAR(50) DEFAULT 'completed',
              notes TEXT,
              created_at TIMESTAMP DEFAULT NOW(),
              updated_at TIMESTAMP DEFAULT NOW()
            )
          `);
        } catch (uuidError: any) {
          // Fallback for older PostgreSQL versions
          await getPool().query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            CREATE TABLE IF NOT EXISTS car_wash_records (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID,
              customer_id UUID,
              customer_name VARCHAR(200),
              customer_email VARCHAR(255),
              customer_phone VARCHAR(20),
              vehicle_brand VARCHAR(100),
              vehicle_model VARCHAR(100),
              vehicle_year INTEGER,
              license_plate VARCHAR(20),
              services_data JSONB,
              total_price DECIMAL(10, 2),
              status VARCHAR(50) DEFAULT 'completed',
              notes TEXT,
              created_at TIMESTAMP DEFAULT NOW(),
              updated_at TIMESTAMP DEFAULT NOW()
            )
          `);
        }
        console.log('✅ Created car_wash_records table');
        
        // Migrate existing data from repair_quotes if it exists and has car wash records
        try {
          const checkOldTable = await getPool().query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'repair_quotes'
            )
          `);
          
          if (checkOldTable.rows[0].exists) {
            // Check if there are records with vehicle_brand (car wash records)
            const oldRecords = await getPool().query(`
              SELECT * FROM repair_quotes 
              WHERE vehicle_brand IS NOT NULL 
              AND (services_data::text LIKE '%package%' OR services_data::text LIKE '%addon%')
              AND NOT EXISTS (
                SELECT 1 FROM car_wash_records cwr 
                WHERE cwr.vehicle_brand = repair_quotes.vehicle_brand 
                AND cwr.vehicle_model = repair_quotes.vehicle_model 
                AND COALESCE(cwr.license_plate, '') = COALESCE(repair_quotes.license_plate, '')
                AND cwr.created_at = repair_quotes.created_at
              )
            `);
            
            if (oldRecords.rows.length > 0) {
              for (const record of oldRecords.rows) {
                await getPool().query(`
                  INSERT INTO car_wash_records 
                  (id, user_id, customer_id, customer_name, customer_email, customer_phone,
                   vehicle_brand, vehicle_model, vehicle_year, license_plate, services_data,
                   total_price, status, notes, created_at, updated_at)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                  ON CONFLICT (id) DO NOTHING
                `, [
                  record.id,
                  record.user_id,
                  record.customer_id,
                  record.customer_name,
                  record.customer_email,
                  record.customer_phone,
                  record.vehicle_brand,
                  record.vehicle_model,
                  record.vehicle_year,
                  record.license_plate,
                  record.services_data,
                  record.total_price,
                  record.status || 'completed',
                  record.notes,
                  record.created_at,
                  record.updated_at || record.created_at
                ]);
              }
              console.log(`✅ Migrated ${oldRecords.rows.length} car wash records from repair_quotes`);
            }
          }
        } catch (migrateError: any) {
          console.warn('⚠️ Migration from repair_quotes failed (non-critical):', migrateError.message);
        }
      } else {
        throw tableError;
      }
    }
    
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
      `INSERT INTO car_wash_records 
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

    const carWashRecord = result.rows[0];

    // Try to create service_records entry if customer info is available
    // This links car wash records to service_records for customer history
    try {
      // Check if service_records table exists and if we can find customer by vehicle
      if (value.license_plate || (value.vehicle_brand && value.vehicle_model)) {
        // Try to find customer by license plate or vehicle info
        let customerQuery = `
          SELECT DISTINCT cv.customer_id 
          FROM customer_vehicles cv
          WHERE 1=1
        `;
        const customerParams: any[] = [];
        
        if (value.license_plate) {
          customerQuery += ` AND cv.license_plate = $1`;
          customerParams.push(value.license_plate);
        } else {
          customerQuery += ` AND cv.brand = $1 AND cv.model = $2`;
          customerParams.push(value.vehicle_brand, value.vehicle_model);
        }
        customerQuery += ` LIMIT 1`;
        
        const customerResult = await getPool().query(customerQuery, customerParams);
        
        if (customerResult.rows.length > 0) {
          const customerId = customerResult.rows[0].customer_id;
          
          // Get vehicle_id if available
          let vehicleId = null;
          if (customerId) {
            const vehicleQuery = value.license_plate
              ? `SELECT id FROM customer_vehicles WHERE customer_id = $1 AND license_plate = $2 LIMIT 1`
              : `SELECT id FROM customer_vehicles WHERE customer_id = $1 AND brand = $2 AND model = $3 LIMIT 1`;
            
            const vehicleParams = value.license_plate
              ? [customerId, value.license_plate]
              : [customerId, value.vehicle_brand, value.vehicle_model];
            
            const vehicleResult = await getPool().query(vehicleQuery, vehicleParams);
            if (vehicleResult.rows.length > 0) {
              vehicleId = vehicleResult.rows[0].id;
            }
          }
          
          // Create service record for car wash (single record with all services combined)
          const servicesNames = value.selected_services.map((s: any) => s.name).join(', ');
          const totalPrice = value.total_price;
          
          await getPool().query(
            `INSERT INTO service_records 
             (customer_id, vehicle_id, service_type, service_name, service_description, price, performed_date, created_at, updated_at)
             VALUES ($1, $2, 'car_wash', $3, $4, $5, CURRENT_DATE, NOW(), NOW())
             RETURNING *`,
            [
              customerId,
              vehicleId,
              `Oto Yıkama: ${servicesNames}`,
              `Oto yıkama hizmetleri: ${servicesNames}`,
              parseFloat(String(totalPrice || 0)),
            ]
          ).catch((err) => {
            // If service_records table structure is different, just log the error
            console.warn('Could not insert into service_records:', err);
          });
        }
      }
    } catch (serviceRecordError) {
      // Non-critical error - log but don't fail the request
      console.warn('Could not create service_records entry for car wash record:', serviceRecordError);
    }

    return NextResponse.json({ quote: carWashRecord }, { status: 201 });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

