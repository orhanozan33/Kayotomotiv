import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { getPool } from '@/lib/config/database';
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

    if (period === 'total') {
      dateFilter = '';
    } else if (period === 'custom' && startDate && endDate) {
      dateFilter = 'WHERE created_at >= $1 AND created_at <= $2';
      params.push(startDate, endDate);
    } else if (period === 'daily') {
      dateFilter = "WHERE DATE(created_at) = CURRENT_DATE";
    } else if (period === 'monthly') {
      dateFilter = "WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)";
    } else if (period === 'yearly') {
      dateFilter = "WHERE DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)";
    }

    // Build date filter for service_records (uses performed_date)
    let serviceRecordsDateFilter = dateFilter ? dateFilter.replace(/created_at/g, 'performed_date') : '';
    
    // Build date filter for car_wash_records (uses created_at)
    let carWashDateFilter = dateFilter;

    // Repair revenue from service_records
    let repairRevenue = 0;
    try {
      let repairQuery = '';
      let repairParams: any[] = [];
      
      if (serviceRecordsDateFilter) {
        repairQuery = `SELECT COALESCE(SUM(price), 0) as total
           FROM service_records
           ${serviceRecordsDateFilter} AND service_type = 'repair'`;
        repairParams = params;
      } else {
        repairQuery = `SELECT COALESCE(SUM(price), 0) as total
           FROM service_records
           WHERE service_type = 'repair'`;
        repairParams = [];
      }
      
      const repairResult = await getPool().query(repairQuery, repairParams);
      repairRevenue = parseFloat(repairResult.rows[0]?.total || 0);
    } catch (error) {
      console.warn('Error calculating repair revenue:', error);
      repairRevenue = 0;
    }

    // Car wash revenue from car_wash_records
    let carWashRevenue = 0;
    try {
      let carWashQuery = '';
      let carWashParams: any[] = [];
      
      if (carWashDateFilter) {
        carWashQuery = `SELECT COALESCE(SUM(total_price), 0) as total
           FROM car_wash_records
           ${carWashDateFilter} AND status = 'completed'`;
        carWashParams = params;
      } else {
        carWashQuery = `SELECT COALESCE(SUM(total_price), 0) as total
           FROM car_wash_records
           WHERE status = 'completed'`;
        carWashParams = [];
      }
      
      const carWashResult = await getPool().query(carWashQuery, carWashParams);
      carWashRevenue = parseFloat(carWashResult.rows[0]?.total || 0);
    } catch (error) {
      console.warn('Error calculating car wash revenue:', error);
      carWashRevenue = 0;
    }

    const totalRevenue = repairRevenue + carWashRevenue;

    return NextResponse.json({
      repair: { total: repairRevenue },
      carWash: { total: carWashRevenue },
      total: totalRevenue,
    });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

