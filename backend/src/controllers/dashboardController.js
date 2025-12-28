import pool from '../config/database.js';

export const getPendingNotifications = async (req, res, next) => {
  try {
    // Get pending reservations
    const reservationsResult = await pool.query(
      `SELECT COUNT(*) as count FROM vehicle_reservations WHERE status = 'pending'`
    );
    
    // Get pending test drive requests
    const testDrivesResult = await pool.query(
      `SELECT COUNT(*) as count FROM test_drive_requests WHERE status = 'pending'`
    );

    const pendingReservations = parseInt(reservationsResult.rows[0].count || 0);
    const pendingTestDrives = parseInt(testDrivesResult.rows[0].count || 0);
    const total = pendingReservations + pendingTestDrives;

    res.json({
      pendingReservations,
      pendingTestDrives,
      total,
      hasNotifications: total > 0
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueStats = async (req, res, next) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    
    let dateFilter = '';
    let params = [];
    let serviceRecordsDateFilter = '';

    // Date range filter (if both startDate and endDate are provided)
    if (startDate && endDate && startDate.trim() !== '' && endDate.trim() !== '') {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter = `AND created_at >= $1 AND created_at <= $2`;
      serviceRecordsDateFilter = `AND performed_date >= $1 AND performed_date <= $2`;
      params = [start, end];
    } else {
      // Period-based filtering (daily, monthly, total)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (period === 'daily') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateFilter = `AND created_at >= $1 AND created_at < $2`;
        serviceRecordsDateFilter = `AND performed_date >= $1 AND performed_date < $2`;
        params = [today, tomorrow];
      } else if (period === 'monthly') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        dateFilter = `AND created_at >= $1 AND created_at < $2`;
        serviceRecordsDateFilter = `AND performed_date >= $1 AND performed_date < $2`;
        params = [startOfMonth, startOfNextMonth];
      }
      // 'total' period doesn't need date filter
    }

    // Get repair revenue from multiple sources:
    // 1. repair_quotes (completed/accepted/quoted status)
    // 2. service_records with service_type = 'repair'
    const repairQuotesQuery = `
      SELECT COALESCE(SUM(total_price), 0) as total 
      FROM repair_quotes 
      WHERE status IN ('completed', 'accepted', 'quoted') AND customer_name != 'Kayıt' AND total_price IS NOT NULL ${dateFilter}
    `;
    const repairQuotesResult = await pool.query(repairQuotesQuery, params);

    const repairServiceRecordsQuery = `
      SELECT COALESCE(SUM(price), 0) as total 
      FROM service_records 
      WHERE service_type = 'repair' AND price IS NOT NULL ${serviceRecordsDateFilter}
    `;
    const repairServiceRecordsResult = await pool.query(repairServiceRecordsQuery, params);

    // Get car wash revenue from multiple sources:
    // 1. car_wash_appointments (completed/confirmed/in_progress status)
    // 2. service_records with service_type = 'car_wash'
    const carWashAppointmentsQuery = `
      SELECT COALESCE(SUM(total_price), 0) as total 
      FROM car_wash_appointments 
      WHERE status IN ('completed', 'confirmed', 'in_progress') AND total_price IS NOT NULL ${dateFilter}
    `;
    const carWashAppointmentsResult = await pool.query(carWashAppointmentsQuery, params);

    const carWashServiceRecordsQuery = `
      SELECT COALESCE(SUM(price), 0) as total 
      FROM service_records 
      WHERE service_type = 'car_wash' AND price IS NOT NULL ${serviceRecordsDateFilter}
    `;
    const carWashServiceRecordsResult = await pool.query(carWashServiceRecordsQuery, params);

    // Combine repair revenue from both sources
    const repairTotal = parseFloat(repairQuotesResult.rows[0]?.total || 0) + 
                       parseFloat(repairServiceRecordsResult.rows[0]?.total || 0);
    
    // Combine car wash revenue from both sources
    const carWashTotal = parseFloat(carWashAppointmentsResult.rows[0]?.total || 0) + 
                        parseFloat(carWashServiceRecordsResult.rows[0]?.total || 0);

    console.log('Revenue stats query:', { period, startDate, endDate, dateFilter, params, 
      repairQuotes: repairQuotesResult.rows[0]?.total,
      repairServiceRecords: repairServiceRecordsResult.rows[0]?.total,
      repairTotal,
      carWashAppointments: carWashAppointmentsResult.rows[0]?.total,
      carWashServiceRecords: carWashServiceRecordsResult.rows[0]?.total,
      carWashTotal
    });

    res.json({
      repair: {
        total: repairTotal
      },
      carWash: {
        total: carWashTotal
      },
      total: repairTotal + carWashTotal
    });
  } catch (error) {
    console.error('Error in getRevenueStats:', error);
    next(error);
  }
};


