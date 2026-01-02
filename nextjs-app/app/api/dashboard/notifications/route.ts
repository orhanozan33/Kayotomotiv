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

    // Unread contact messages
    const unreadMessages = await getPool().query(
      "SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread' OR status IS NULL"
    );
    const unreadCount = parseInt(unreadMessages.rows[0].count);
    if (unreadCount > 0) {
      notifications.push({
        type: 'contact_message',
        message: `${unreadCount} okunmamış mesaj var`,
        count: unreadCount,
      });
    }

    const pendingReservationsCount = parseInt(pendingReservations.rows[0].count);
    const pendingTestDrivesCount = parseInt(pendingTestDrives.rows[0].count);
    const total = pendingReservationsCount + pendingTestDrivesCount + unreadCount;

    return NextResponse.json({
      notifications,
      pendingReservations: pendingReservationsCount,
      pendingTestDrives: pendingTestDrivesCount,
      pendingMessages: unreadCount,
      total,
      hasNotifications: total > 0,
    });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

