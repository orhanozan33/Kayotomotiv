import pool from '../config/database.js';

export const createReservation = async (req, res, next) => {
  try {
    const { vehicle_id, customer_name, customer_email, customer_phone, message, preferred_date, preferred_time } = req.body;

    const result = await pool.query(
      `INSERT INTO vehicle_reservations 
       (vehicle_id, user_id, customer_name, customer_email, customer_phone, message, preferred_date, preferred_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [vehicle_id, req.user?.id || null, customer_name, customer_email, customer_phone, message, preferred_date || null, preferred_time || null]
    );

    res.status(201).json({ reservation: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getReservations = async (req, res, next) => {
  try {
    // For admin: Get all reservation records AND all reserved vehicles
    if (req.user.role === 'admin') {
      // First, get all reservation records
      let reservationsQuery = `
        SELECT vr.*, v.brand, v.model, v.year, v.status as vehicle_status
        FROM vehicle_reservations vr
        JOIN vehicles v ON vr.vehicle_id = v.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (req.query.status) {
        reservationsQuery += ` AND vr.status = $${paramCount++}`;
        params.push(req.query.status);
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
      const vehiclesWithReservations = new Set(reservationsResult.rows.map(r => r.vehicle_id));
      
      // For vehicles without reservation records, create synthetic reservation entries
      const syntheticReservations = reservedVehiclesResult.rows
        .filter(v => !vehiclesWithReservations.has(v.vehicle_id))
        .map(v => ({
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
      allReservations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      res.json({ reservations: allReservations });
    } else {
      // For non-admin users, show all reservations (same as admin)
      let reservationsQuery = `
        SELECT vr.*, v.brand, v.model, v.year, v.status as vehicle_status
        FROM vehicle_reservations vr
        JOIN vehicles v ON vr.vehicle_id = v.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (req.query.status) {
        reservationsQuery += ` AND vr.status = $${paramCount++}`;
        params.push(req.query.status);
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
      const vehiclesWithReservations = new Set(reservationsResult.rows.map(r => r.vehicle_id));
      
      // For vehicles without reservation records, create synthetic reservation entries
      const syntheticReservations = reservedVehiclesResult.rows
        .filter(v => !vehiclesWithReservations.has(v.vehicle_id))
        .map(v => ({
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
      allReservations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      res.json({ reservations: allReservations });
    }
  } catch (error) {
    next(error);
  }
};

export const updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // Get reservation details first
    const reservationResult = await pool.query(
      'SELECT * FROM vehicle_reservations WHERE id = $1',
      [req.params.id]
    );

    if (reservationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = reservationResult.rows[0];
    let reservationEndTime = null;

    // If reservation is confirmed, calculate reservation_end_time
    if (status === 'confirmed' && reservation.preferred_date && reservation.preferred_time) {
      try {
        // Combine date and time to create reservation end time
        // preferred_date is DATE format (YYYY-MM-DD), preferred_time is TIME format (HH:MM:SS)
        const dateTimeString = `${reservation.preferred_date}T${reservation.preferred_time}`;
        const dateObj = new Date(dateTimeString);
        
        // Validate date
        if (isNaN(dateObj.getTime())) {
          throw new Error('Invalid date or time format');
        }
        
        reservationEndTime = dateObj.toISOString();
      } catch (error) {
        console.error('Error parsing date/time:', error);
        // If date parsing fails, don't set reservation_end_time
        reservationEndTime = null;
      }
    }

    // Update reservation with status and end time
    const updateQuery = reservationEndTime
      ? 'UPDATE vehicle_reservations SET status = $1, reservation_end_time = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *'
      : 'UPDATE vehicle_reservations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    
    const updateParams = reservationEndTime
      ? [status, reservationEndTime, req.params.id]
      : [status, req.params.id];

    const result = await pool.query(updateQuery, updateParams);

    // If reservation is confirmed, update vehicle status to 'reserved' and set end time
    if (status === 'confirmed') {
      const vehicleUpdateQuery = reservationEndTime
        ? 'UPDATE vehicles SET status = $1, reservation_end_time = $2 WHERE id = $3'
        : 'UPDATE vehicles SET status = $1 WHERE id = $2';
      
      const vehicleUpdateParams = reservationEndTime
        ? ['reserved', reservationEndTime, reservation.vehicle_id]
        : ['reserved', reservation.vehicle_id];
      
      await pool.query(vehicleUpdateQuery, vehicleUpdateParams);
    }

    // If reservation is cancelled, also update vehicle status back to available
    if (status === 'cancelled') {
      await pool.query(
        'UPDATE vehicles SET status = $1, reservation_end_time = NULL WHERE id = $2',
        ['available', reservation.vehicle_id]
      );
    }

    res.json({ reservation: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteReservation = async (req, res, next) => {
  try {
    // Get reservation details first to get vehicle_id
    const reservationResult = await pool.query(
      'SELECT * FROM vehicle_reservations WHERE id = $1',
      [req.params.id]
    );

    if (reservationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = reservationResult.rows[0];

    // Delete the reservation
    await pool.query('DELETE FROM vehicle_reservations WHERE id = $1', [req.params.id]);

    // Update vehicle status back to available and clear reservation_end_time
    await pool.query(
      'UPDATE vehicles SET status = $1, reservation_end_time = NULL WHERE id = $2',
      ['available', reservation.vehicle_id]
    );

    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const createTestDriveRequest = async (req, res, next) => {
  try {
    const { vehicle_id, customer_name, customer_email, customer_phone, preferred_date, preferred_time, message } = req.body;

    const result = await pool.query(
      `INSERT INTO test_drive_requests
       (vehicle_id, user_id, customer_name, customer_email, customer_phone, preferred_date, preferred_time, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [vehicle_id, req.user?.id || null, customer_name, customer_email, customer_phone, preferred_date, preferred_time, message]
    );

    res.status(201).json({ testDriveRequest: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getTestDriveRequests = async (req, res, next) => {
  try {
    // Show all test drive requests for all authenticated users (admin and regular users)
    let query = `
      SELECT tdr.*, v.brand, v.model, v.year
      FROM test_drive_requests tdr
      JOIN vehicles v ON tdr.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (req.query.status) {
      query += ` AND tdr.status = $${paramCount++}`;
      params.push(req.query.status);
    }

    query += ' ORDER BY tdr.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ testDriveRequests: result.rows });
  } catch (error) {
    next(error);
  }
};

export const deleteTestDriveRequest = async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM test_drive_requests WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test drive request not found' });
    }

    res.json({ message: 'Test drive request deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateTestDriveRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // Get test drive request details first
    const testDriveResult = await pool.query(
      'SELECT * FROM test_drive_requests WHERE id = $1',
      [req.params.id]
    );

    if (testDriveResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test drive request not found' });
    }

    const testDriveRequest = testDriveResult.rows[0];
    let reservationEndTime = null;

    // If test drive is confirmed, calculate reservation_end_time
    if (status === 'confirmed' && testDriveRequest.preferred_date && testDriveRequest.preferred_time) {
      try {
        // Combine date and time to create reservation end time
        // preferred_date is DATE format (YYYY-MM-DD), preferred_time is TIME format (HH:MM:SS)
        const dateTimeString = `${testDriveRequest.preferred_date}T${testDriveRequest.preferred_time}`;
        const dateObj = new Date(dateTimeString);
        
        // Validate date
        if (isNaN(dateObj.getTime())) {
          throw new Error('Invalid date or time format');
        }
        
        reservationEndTime = dateObj.toISOString();
      } catch (error) {
        console.error('Error parsing date/time:', error);
        // If date parsing fails, don't set reservation_end_time
        reservationEndTime = null;
      }
    }

    // Update test drive request with status and end time
    const updateQuery = reservationEndTime
      ? 'UPDATE test_drive_requests SET status = $1, reservation_end_time = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *'
      : 'UPDATE test_drive_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    
    const updateParams = reservationEndTime
      ? [status, reservationEndTime, req.params.id]
      : [status, req.params.id];

    const result = await pool.query(updateQuery, updateParams);

    // If test drive is confirmed, update vehicle status to 'reserved' and set end time
    if (status === 'confirmed') {
      const vehicleUpdateQuery = reservationEndTime
        ? 'UPDATE vehicles SET status = $1, reservation_end_time = $2 WHERE id = $3'
        : 'UPDATE vehicles SET status = $1 WHERE id = $2';
      
      const vehicleUpdateParams = reservationEndTime
        ? ['reserved', reservationEndTime, testDriveRequest.vehicle_id]
        : ['reserved', testDriveRequest.vehicle_id];
      
      await pool.query(vehicleUpdateQuery, vehicleUpdateParams);
    }

    res.json({ testDriveRequest: result.rows[0] });
  } catch (error) {
    next(error);
  }
};


