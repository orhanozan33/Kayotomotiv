import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed').required(),
});

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
    const { error, value } = updateStatusSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    // Get reservation details first
    const reservationResult = await pool.query(
      'SELECT * FROM vehicle_reservations WHERE id = $1',
      [resolvedParams.id]
    );

    if (reservationResult.rows.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const reservation = reservationResult.rows[0];
    let reservationEndTime = null;

    // If reservation is confirmed, calculate reservation_end_time
    if (value.status === 'confirmed' && reservation.preferred_date && reservation.preferred_time) {
      try {
        // Combine date and time to create reservation end time
        // preferred_date is DATE format (YYYY-MM-DD), preferred_time is TIME format (HH:MM:SS)
        const dateTimeString = `${reservation.preferred_date}T${reservation.preferred_time}`;
        const dateObj = new Date(dateTimeString);
        
        // Validate date
        if (!isNaN(dateObj.getTime())) {
          reservationEndTime = dateObj.toISOString();
        }
      } catch (error) {
        console.error('Error parsing date/time:', error);
        // If date parsing fails, don't set reservation_end_time
        reservationEndTime = null;
      }
    }

    // Update reservation with status and end time
    const updateQuery = reservationEndTime
      ? 'UPDATE vehicle_reservations SET status = $1, reservation_end_time = $2, updated_at = NOW() WHERE id = $3 RETURNING *'
      : 'UPDATE vehicle_reservations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
    
    const updateParams = reservationEndTime
      ? [value.status, reservationEndTime, resolvedParams.id]
      : [value.status, resolvedParams.id];

    const result = await pool.query(updateQuery, updateParams);

    // If reservation is confirmed, update vehicle status to 'reserved' and set end time
    if (value.status === 'confirmed' && reservation.vehicle_id) {
      const vehicleUpdateQuery = reservationEndTime
        ? 'UPDATE vehicles SET status = $1, reservation_end_time = $2 WHERE id = $3'
        : 'UPDATE vehicles SET status = $1 WHERE id = $2';
      
      const vehicleUpdateParams = reservationEndTime
        ? ['reserved', reservationEndTime, reservation.vehicle_id]
        : ['reserved', reservation.vehicle_id];
      
      await pool.query(vehicleUpdateQuery, vehicleUpdateParams);
    }

    // If reservation is cancelled, also update vehicle status back to available
    if (value.status === 'cancelled' && reservation.vehicle_id) {
      await pool.query(
        'UPDATE vehicles SET status = $1, reservation_end_time = NULL WHERE id = $2',
        ['available', reservation.vehicle_id]
      );
    }

    return NextResponse.json({ reservation: result.rows[0] });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

