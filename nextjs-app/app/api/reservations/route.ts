import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const createReservationSchema = Joi.object({
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

    const { error, value } = createReservationSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const authResult = await authenticate(request);
    const userId = authResult.user?.id || null;

    const result = await pool.query(
      `INSERT INTO vehicle_reservations 
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

    return NextResponse.json({ reservation: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // For admin: Get all reservation records AND all reserved vehicles
    if (authResult.user!.role === 'admin') {
      // First, get all reservation records
      let reservationsQuery = `
        SELECT vr.*, v.brand, v.model, v.year, v.status as vehicle_status
        FROM vehicle_reservations vr
        JOIN vehicles v ON vr.vehicle_id = v.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramCount = 1;

      if (status) {
        reservationsQuery += ` AND vr.status = $${paramCount++}`;
        params.push(status);
      }

      reservationsQuery += ' ORDER BY vr.created_at DESC';
      const reservationsResult = await pool.query(reservationsQuery, params);
      
      // Also get all vehicles with reserved status (to catch vehicles without reservation records)
      const reservedVehiclesQuery = `
        SELECT 
          v.id as vehicle_id,
          v.status as vehicle_status,
          v.reservation_end_time,
          v.brand,
          v.model,
          v.year,
          v.updated_at,
          v.created_at
        FROM vehicles v
        WHERE v.status = 'reserved'
      `;
      
      const reservedVehiclesResult = await pool.query(reservedVehiclesQuery);
      
      // Create a set of vehicle IDs that already have reservation records
      const vehiclesWithReservations = new Set(reservationsResult.rows.map((r: any) => r.vehicle_id));
      
      // For vehicles without reservation records, create synthetic reservation entries
      const syntheticReservations = reservedVehiclesResult.rows
        .filter((v: any) => !vehiclesWithReservations.has(v.vehicle_id))
        .map((v: any) => ({
          id: `vehicle-${v.vehicle_id}`,
          vehicle_id: v.vehicle_id,
          customer_name: 'Bilinmiyor',
          customer_email: '',
          customer_phone: '',
          message: '',
          status: 'confirmed',
          created_at: v.updated_at || v.created_at,
          updated_at: v.updated_at || v.created_at,
          user_id: null,
          customer_id: null,
          preferred_date: null,
          preferred_time: null,
          reservation_end_time: v.reservation_end_time,
          brand: v.brand,
          model: v.model,
          year: v.year,
          vehicle_status: v.vehicle_status
        }));
      
      // Combine both lists - include all reservation records AND synthetic ones for vehicles without records
      const allReservations = [...reservationsResult.rows, ...syntheticReservations];
      
      // Sort by created_at descending
      allReservations.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return NextResponse.json({ reservations: allReservations });
    } else {
      // For non-admin users, show all reservations (same as admin)
      let reservationsQuery = `
        SELECT vr.*, v.brand, v.model, v.year, v.status as vehicle_status
        FROM vehicle_reservations vr
        JOIN vehicles v ON vr.vehicle_id = v.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramCount = 1;

      if (status) {
        reservationsQuery += ` AND vr.status = $${paramCount++}`;
        params.push(status);
      }

      reservationsQuery += ' ORDER BY vr.created_at DESC';
      const reservationsResult = await pool.query(reservationsQuery, params);
      
      // Also get all vehicles with reserved status (to catch vehicles without reservation records)
      const reservedVehiclesQuery = `
        SELECT 
          v.id as vehicle_id,
          v.status as vehicle_status,
          v.reservation_end_time,
          v.brand,
          v.model,
          v.year,
          v.updated_at,
          v.created_at
        FROM vehicles v
        WHERE v.status = 'reserved'
      `;
      
      const reservedVehiclesResult = await pool.query(reservedVehiclesQuery);
      
      // Create a set of vehicle IDs that already have reservation records
      const vehiclesWithReservations = new Set(reservationsResult.rows.map((r: any) => r.vehicle_id));
      
      // For vehicles without reservation records, create synthetic reservation entries
      const syntheticReservations = reservedVehiclesResult.rows
        .filter((v: any) => !vehiclesWithReservations.has(v.vehicle_id))
        .map((v: any) => ({
          id: `vehicle-${v.vehicle_id}`,
          vehicle_id: v.vehicle_id,
          customer_name: 'Bilinmiyor',
          customer_email: '',
          customer_phone: '',
          message: '',
          status: 'confirmed',
          created_at: v.updated_at || v.created_at,
          updated_at: v.updated_at || v.created_at,
          user_id: null,
          customer_id: null,
          preferred_date: null,
          preferred_time: null,
          reservation_end_time: v.reservation_end_time,
          brand: v.brand,
          model: v.model,
          year: v.year,
          vehicle_status: v.vehicle_status
        }));
      
      // Combine both lists - include all reservation records AND synthetic ones for vehicles without records
      const allReservations = [...reservationsResult.rows, ...syntheticReservations];
      
      // Sort by created_at descending
      allReservations.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return NextResponse.json({ reservations: allReservations });
    }
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

