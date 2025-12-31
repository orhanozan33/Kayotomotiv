import pool from '../config/database.js';

export const getPackages = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM car_wash_packages WHERE is_active = true ORDER BY display_order, name'
    );
    res.json({ packages: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getAllPackages = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM car_wash_packages ORDER BY display_order, name'
    );
    res.json({ packages: result.rows });
  } catch (error) {
    next(error);
  }
};

export const createPackage = async (req, res, next) => {
  try {
    const { name, description, base_price, duration_minutes, display_order } = req.body;
    const result = await pool.query(
      `INSERT INTO car_wash_packages (name, description, base_price, duration_minutes, display_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, base_price, duration_minutes, display_order || 0]
    );
    res.status(201).json({ package: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const updatePackage = async (req, res, next) => {
  try {
    const { name, description, base_price, duration_minutes, is_active, display_order } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) { updates.push(`name = $${paramCount++}`); values.push(name); }
    if (description !== undefined) { updates.push(`description = $${paramCount++}`); values.push(description); }
    if (base_price !== undefined) { updates.push(`base_price = $${paramCount++}`); values.push(base_price); }
    if (duration_minutes !== undefined) { updates.push(`duration_minutes = $${paramCount++}`); values.push(duration_minutes); }
    if (is_active !== undefined) { updates.push(`is_active = $${paramCount++}`); values.push(is_active); }
    if (display_order !== undefined) { updates.push(`display_order = $${paramCount++}`); values.push(display_order); }

    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE car_wash_packages SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json({ package: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM car_wash_packages WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAddons = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM car_wash_addons WHERE is_active = true ORDER BY display_order, name'
    );
    res.json({ addons: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getAllAddons = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM car_wash_addons ORDER BY display_order, name'
    );
    res.json({ addons: result.rows });
  } catch (error) {
    next(error);
  }
};

export const createAddon = async (req, res, next) => {
  try {
    const { name, description, price, display_order } = req.body;
    const result = await pool.query(
      `INSERT INTO car_wash_addons (name, description, price, display_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, price, display_order || 0]
    );
    res.status(201).json({ addon: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const updateAddon = async (req, res, next) => {
  try {
    const { name, description, price, is_active, display_order } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) { updates.push(`name = $${paramCount++}`); values.push(name); }
    if (description !== undefined) { updates.push(`description = $${paramCount++}`); values.push(description); }
    if (price !== undefined) { updates.push(`price = $${paramCount++}`); values.push(price); }
    if (is_active !== undefined) { updates.push(`is_active = $${paramCount++}`); values.push(is_active); }
    if (display_order !== undefined) { updates.push(`display_order = $${paramCount++}`); values.push(display_order); }

    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE car_wash_addons SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Addon not found' });
    }

    res.json({ addon: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteAddon = async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM car_wash_addons WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Addon not found' });
    }

    res.json({ message: 'Addon deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req, res, next) => {
  try {
    const { package_id, appointment_date, appointment_time, addon_ids, notes, vehicle_brand, vehicle_model } = req.body;

    // Get package details
    const packageResult = await pool.query('SELECT * FROM car_wash_packages WHERE id = $1', [package_id]);
    if (packageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }
    const packageData = packageResult.rows[0];

    // Calculate total price
    let totalPrice = packageData.base_price;

    // Get addons and calculate price
    const addons = [];
    if (addon_ids && addon_ids.length > 0) {
      const addonResult = await pool.query(
        `SELECT * FROM car_wash_addons WHERE id = ANY($1::uuid[])`,
        [addon_ids]
      );
      addons.push(...addonResult.rows);
      totalPrice += addons.reduce((sum, addon) => sum + parseFloat(addon.price), 0);
    }

    const customer_name = req.body.customer_name || `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim();
    const customer_email = req.body.customer_email || req.user?.email;
    const customer_phone = req.body.customer_phone || req.user?.phone;

    // Create appointment
    const appointmentResult = await pool.query(
      `INSERT INTO car_wash_appointments
       (user_id, customer_name, customer_email, customer_phone, package_id, package_name, package_price,
        appointment_date, appointment_time, total_price, notes, vehicle_brand, vehicle_model)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [req.user?.id || null, customer_name, customer_email, customer_phone, package_id,
       packageData.name, packageData.base_price, appointment_date, appointment_time, totalPrice, notes,
       vehicle_brand || null, vehicle_model || null]
    );

    const appointment = appointmentResult.rows[0];

    // Create appointment addons
    for (const addon of addons) {
      await pool.query(
        `INSERT INTO car_wash_appointment_addons (appointment_id, addon_id, addon_name, price)
         VALUES ($1, $2, $3, $4)`,
        [appointment.id, addon.id, addon.name, addon.price]
      );
    }

    // Fetch complete appointment with addons
    const addonsResult = await pool.query(
      'SELECT * FROM car_wash_appointment_addons WHERE appointment_id = $1',
      [appointment.id]
    );

    res.status(201).json({
      appointment: { ...appointment, addons: addonsResult.rows }
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    // Show all appointments for all authenticated users (admin and regular users)
    let query = 'SELECT * FROM car_wash_appointments WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (req.query.date) {
      query += ` AND appointment_date = $${paramCount++}`;
      params.push(req.query.date);
    }

    if (req.query.status) {
      query += ` AND status = $${paramCount++}`;
      params.push(req.query.status);
    }

    query += ' ORDER BY appointment_date, appointment_time';

    const result = await pool.query(query, params);

    // Get addons for each appointment
    const appointmentsWithAddons = await Promise.all(
      result.rows.map(async (appointment) => {
        const addonsResult = await pool.query(
          'SELECT * FROM car_wash_appointment_addons WHERE appointment_id = $1',
          [appointment.id]
        );
        return { ...appointment, addons: addonsResult.rows };
      })
    );

    res.json({ appointments: appointmentsWithAddons });
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    // First delete related appointment addons
    await pool.query('DELETE FROM car_wash_appointment_addons WHERE appointment_id = $1', [req.params.id]);
    
    // Then delete the appointment
    const result = await pool.query(
      'DELETE FROM car_wash_appointments WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const updates = ['status = $1'];
    const values = [status];
    let paramCount = 2;

    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE car_wash_appointments SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ appointment: result.rows[0] });
  } catch (error) {
    next(error);
  }
};


