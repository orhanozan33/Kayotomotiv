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

    const notifications: any[] = [];

    // Pending reservations
    const pendingReservations = await getPool().query(
      "SELECT COUNT(*) as count FROM vehicle_reservations WHERE status = 'pending'"
    );
    if (parseInt(pendingReservations.rows[0].count) > 0) {
      notifications.push({
        type: 'reservation',
        message: `${pendingReservations.rows[0].count} rezervasyon talebi bekliyor`,
        count: parseInt(pendingReservations.rows[0].count),
      });
    }

    // Pending test drives
    const pendingTestDrives = await getPool().query(
      "SELECT COUNT(*) as count FROM test_drive_requests WHERE status = 'pending'"
    );
    if (parseInt(pendingTestDrives.rows[0].count) > 0) {
      notifications.push({
        type: 'test_drive',
        message: `${pendingTestDrives.rows[0].count} test sürüşü talebi bekliyor`,
        count: parseInt(pendingTestDrives.rows[0].count),
      });
    }

    return NextResponse.json({ notifications });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

