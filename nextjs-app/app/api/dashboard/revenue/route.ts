import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';

const isProduction = process.env.NODE_ENV === 'production';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let dateFilter = '';
    const params: any[] = [];

    if (period === 'custom' && startDate && endDate) {
      dateFilter = 'WHERE created_at >= $1 AND created_at <= $2';
      params.push(startDate, endDate);
    } else if (period === 'daily') {
      dateFilter = "WHERE DATE(created_at) = CURRENT_DATE";
    } else if (period === 'monthly') {
      dateFilter = "WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)";
    } else if (period === 'yearly') {
      dateFilter = "WHERE DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)";
    }

    // Repair revenue
    const repairResult = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0) as total
       FROM repair_quotes
       ${dateFilter}
       AND status = 'completed'`,
      params
    );

    // Car wash revenue
    const carWashResult = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0) as total
       FROM car_wash_appointments
       ${dateFilter}
       AND status = 'completed'`,
      params
    );

    const repairRevenue = parseFloat(repairResult.rows[0].total || 0);
    const carWashRevenue = parseFloat(carWashResult.rows[0].total || 0);
    const totalRevenue = repairRevenue + carWashRevenue;

    return NextResponse.json({
      repairRevenue,
      carWashRevenue,
      totalRevenue,
    });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

