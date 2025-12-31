import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
import { authenticate, requireAdmin } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const createCarWashAppointmentSchema = Joi.object({
  package_id: Joi.string().uuid().required(),
  appointment_date: Joi.string().required(),
  appointment_time: Joi.string().required(),
  addon_ids: Joi.array().items(Joi.string().uuid()).default([]),
  customer_name: Joi.string().required(),
  customer_email: Joi.string().email().required(),
  customer_phone: Joi.string().required(),
  vehicle_brand: Joi.string().allow(null, '').optional(),
  vehicle_model: Joi.string().allow(null, '').optional(),
  notes: Joi.string().allow('', null).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const body = await request.json();

    const { error, value } = createCarWashAppointmentSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO car_wash_appointments 
       (package_id, appointment_date, appointment_time, addon_ids, customer_name, customer_email, customer_phone, vehicle_brand, vehicle_model, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        value.package_id,
        value.appointment_date,
        value.appointment_time,
        JSON.stringify(value.addon_ids || []),
        value.customer_name,
        value.customer_email,
        value.customer_phone,
        value.vehicle_brand || null,
        value.vehicle_model || null,
        value.notes || null,
      ]
    );

    return NextResponse.json({ appointment: result.rows[0] }, { status: 201 });
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

    const result = await pool.query(`
      SELECT 
        cwa.*,
        cwp.name as package_name,
        cwp.base_price as package_price,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', cwa_addons.id,
              'name', cwa_addons.name,
              'price', cwa_addons.price
            )
          )
          FROM car_wash_addons cwa_addons
          WHERE cwa_addons.id = ANY(
            SELECT json_array_elements_text(COALESCE(cwa.addon_ids, '[]'::jsonb)::json)::uuid
          )
        ), '[]'::json) as addons
      FROM car_wash_appointments cwa
      LEFT JOIN car_wash_packages cwp ON cwa.package_id = cwp.id
      ORDER BY cwa.appointment_date DESC, cwa.appointment_time DESC
    `);

    const appointments = result.rows.map((row: any) => {
      const addons = Array.isArray(row.addons) ? row.addons : [];
      const addonsTotal = addons.reduce((sum: number, addon: any) => sum + parseFloat(addon.price || 0), 0);
      const totalPrice = parseFloat(row.package_price || 0) + addonsTotal;

      return {
        ...row,
        addons: addons.map((a: any) => ({ addon_name: a.name, price: a.price })),
        total_price: totalPrice,
      };
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

