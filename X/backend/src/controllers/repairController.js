import pool from '../config/database.js';

export const getServices = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM repair_services WHERE is_active = true ORDER BY display_order, name'
    );
    res.json({ services: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getAllServices = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM repair_services ORDER BY display_order, name'
    );
    res.json({ services: result.rows });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const { name, description, category, base_price, display_order } = req.body;
    const result = await pool.query(
      `INSERT INTO repair_services (name, description, category, base_price, display_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, category, base_price, display_order || 0]
    );
    res.status(201).json({ service: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { name, description, category, base_price, is_active, display_order } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) { updates.push(`name = $${paramCount++}`); values.push(name); }
    if (description !== undefined) { updates.push(`description = $${paramCount++}`); values.push(description); }
    if (category !== undefined) { updates.push(`category = $${paramCount++}`); values.push(category); }
    if (base_price !== undefined) { updates.push(`base_price = $${paramCount++}`); values.push(base_price); }
    if (is_active !== undefined) { updates.push(`is_active = $${paramCount++}`); values.push(is_active); }
    if (display_order !== undefined) { updates.push(`display_order = $${paramCount++}`); values.push(display_order); }

    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE repair_services SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ service: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM repair_services WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const createQuote = async (req, res, next) => {
  try {
    const { vehicle_brand, vehicle_model, vehicle_year, services } = req.body;
    const customer_name = req.body.customer_name || `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim();
    const customer_email = req.body.customer_email || req.user?.email;
    const customer_phone = req.body.customer_phone || req.user?.phone;

    // Calculate total price
    let totalPrice = 0;
    const quoteItems = [];

    for (const serviceItem of services) {
      const serviceResult = await pool.query('SELECT * FROM repair_services WHERE id = $1', [serviceItem.service_id]);
      if (serviceResult.rows.length === 0) continue;

      const service = serviceResult.rows[0];
      const price = serviceItem.price || service.base_price || 0;
      totalPrice += price * (serviceItem.quantity || 1);

      quoteItems.push({
        service_id: service.id,
        service_name: service.name,
        price: price,
        quantity: serviceItem.quantity || 1
      });
    }

    // Create quote
    const quoteResult = await pool.query(
      `INSERT INTO repair_quotes 
       (user_id, customer_name, customer_email, customer_phone, vehicle_brand, vehicle_model, vehicle_year, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user?.id || null, customer_name, customer_email, customer_phone, vehicle_brand, vehicle_model, vehicle_year, totalPrice]
    );

    const quote = quoteResult.rows[0];

    // Create quote items
    for (const item of quoteItems) {
      await pool.query(
        `INSERT INTO repair_quote_items (quote_id, service_id, service_name, price, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [quote.id, item.service_id, item.service_name, item.price, item.quantity]
      );
    }

    // Fetch complete quote with items
    const itemsResult = await pool.query(
      'SELECT * FROM repair_quote_items WHERE quote_id = $1',
      [quote.id]
    );

    res.status(201).json({
      quote: { ...quote, items: itemsResult.rows }
    });
  } catch (error) {
    next(error);
  }
};

export const getQuotes = async (req, res, next) => {
  try {
    // Get real repair quotes (NOT vehicle records from "Oto Yıkama Kayıt")
    // Vehicle records are identified by customer_name = 'Kayıt'
    // Show all quotes for all authenticated users (admin and regular users)
    let query = "SELECT * FROM repair_quotes WHERE customer_name != 'Kayıt'";
    const params = [];
    let paramCount = 1;

    if (req.query.status) {
      query += ` AND status = $${paramCount++}`;
      params.push(req.query.status);
    }

    if (req.query.search) {
      query += ` AND (customer_name ILIKE $${paramCount} OR vehicle_brand ILIKE $${paramCount} OR vehicle_model ILIKE $${paramCount})`;
      params.push(`%${req.query.search}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    // Get items for each quote
    const quotesWithItems = await Promise.all(
      result.rows.map(async (quote) => {
        const itemsResult = await pool.query(
          'SELECT * FROM repair_quote_items WHERE quote_id = $1',
          [quote.id]
        );
        return { ...quote, items: itemsResult.rows };
      })
    );

    res.json({ quotes: quotesWithItems });
  } catch (error) {
    next(error);
  }
};

export const deleteQuote = async (req, res, next) => {
  try {
    // First delete related quote items
    await pool.query('DELETE FROM repair_quote_items WHERE quote_id = $1', [req.params.id]);
    
    // Then delete the quote
    const result = await pool.query(
      'DELETE FROM repair_quotes WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateQuoteStatus = async (req, res, next) => {
  try {
    const { status, notes, total_price } = req.body;
    const updates = ['status = $1'];
    const values = [status];
    let paramCount = 2;

    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    if (total_price !== undefined) {
      updates.push(`total_price = $${paramCount++}`);
      values.push(total_price);
    }

    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE repair_quotes SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({ quote: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req, res, next) => {
  try {
    const {
      quote_id, vehicle_brand, vehicle_model, vehicle_year,
      appointment_date, appointment_time, service_description, notes
    } = req.body;

    const customer_name = req.body.customer_name || `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim();
    const customer_email = req.body.customer_email || req.user?.email;
    const customer_phone = req.body.customer_phone || req.user?.phone;

    const result = await pool.query(
      `INSERT INTO repair_appointments
       (quote_id, user_id, customer_name, customer_email, customer_phone, vehicle_brand, vehicle_model, vehicle_year,
        appointment_date, appointment_time, service_description, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [quote_id || null, req.user?.id || null, customer_name, customer_email, customer_phone,
       vehicle_brand, vehicle_model, vehicle_year, appointment_date, appointment_time, service_description, notes]
    );

    res.status(201).json({ appointment: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    // Show all appointments for all authenticated users (admin and regular users)
    let query = 'SELECT * FROM repair_appointments WHERE 1=1';
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
    res.json({ appointments: result.rows });
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
      `UPDATE repair_appointments SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
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

export const createVehicleRecord = async (req, res, next) => {
  try {
    const { vehicle_brand, vehicle_model, license_plate, selected_services } = req.body;

    // Validate required fields
    if (!vehicle_brand || !vehicle_brand.trim()) {
      return res.status(400).json({ error: 'Marka gereklidir' });
    }
    if (!vehicle_model || !vehicle_model.trim()) {
      return res.status(400).json({ error: 'Model gereklidir' });
    }
    if (!license_plate || !license_plate.trim()) {
      return res.status(400).json({ error: 'Plaka gereklidir' });
    }

    // Calculate total price from selected services (packages and addons)
    let totalPrice = 0;
    const serviceItems = [];

    if (selected_services && selected_services.length > 0) {
      for (const service of selected_services) {
        if (service.type === 'package') {
          totalPrice += parseFloat(service.price || 0);
          serviceItems.push({ type: 'package', name: service.name, price: parseFloat(service.price || 0) });
        } else if (service.type === 'addon') {
          totalPrice += parseFloat(service.price || 0);
          serviceItems.push({ type: 'addon', name: service.name, price: parseFloat(service.price || 0) });
        }
      }
    }

    // Create a simple quote record for the vehicle
    // Mark it with customer_name = 'Kayıt' to distinguish from regular quotes
    // Note: vehicle_year is NOT NULL in schema, so we use 0 as default
    // license_plate is stored in notes along with service items
    const notesData = {
      license_plate: license_plate,
      services: serviceItems
    };
    
    const result = await pool.query(
      `INSERT INTO repair_quotes 
       (user_id, customer_name, customer_email, customer_phone, vehicle_brand, vehicle_model, vehicle_year, total_price, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        req.user?.id || null,
        'Kayıt', // Default customer name to identify vehicle records
        '', // Default email
        '', // Default phone
        vehicle_brand,
        vehicle_model,
        0, // Default year (vehicle_year is NOT NULL in schema)
        totalPrice,
        'completed', // Mark as completed since it's a record
        JSON.stringify(notesData) // Store license_plate and selected services in notes as JSON
      ]
    );

    res.status(201).json({ quote: result.rows[0] });
  } catch (error) {
    console.error('Error creating vehicle record:', error);
    next(error);
  }
};

export const getVehicleRecords = async (req, res, next) => {
  try {
    // Get only vehicle records (created via "Araç Ekle" button in "Oto Yıkama Kayıt")
    // These are identified by customer_name = 'Kayıt'
    // Show all records for all authenticated users (admin and regular users)
    let query = "SELECT * FROM repair_quotes WHERE customer_name = 'Kayıt'";
    const params = [];
    let paramCount = 1;

    if (req.query.status) {
      query += ` AND status = $${paramCount++}`;
      params.push(req.query.status);
    }

    if (req.query.search) {
      // Search in vehicle_brand, vehicle_model, and notes (for license_plate)
      // Notes is stored as TEXT containing JSON string
      // We search in the JSON text directly which will match license_plate value
      query += ` AND (
        vehicle_brand ILIKE $${paramCount} 
        OR vehicle_model ILIKE $${paramCount} 
        OR (notes IS NOT NULL AND notes ILIKE $${paramCount})
      )`;
      params.push(`%${req.query.search}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    // Parse notes to extract license_plate and services for vehicle records
    const quotesWithParsedData = result.rows.map((quote) => {
      let parsedNotes = { license_plate: '-', services: [] };
      try {
        if (quote.notes) {
          const notesObj = JSON.parse(quote.notes);
          parsedNotes.license_plate = notesObj.license_plate || '-';
          parsedNotes.services = notesObj.services || [];
        }
      } catch (e) {
        console.error('Error parsing notes for quote:', quote.id, e);
      }
      return {
        ...quote,
        license_plate: parsedNotes.license_plate,
        parsed_services: parsedNotes.services
      };
    });

    res.json({ quotes: quotesWithParsedData });
  } catch (error) {
    next(error);
  }
};

export const getVehicleRecordsRevenue = async (req, res, next) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    let dateFilter = '';
    const params = [];
    let paramCount = 1;

    // Build date filter based on period
    if (period === 'daily') {
      dateFilter = "AND DATE(created_at) = CURRENT_DATE";
    } else if (period === 'monthly') {
      dateFilter = "AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)";
    } else if (period === 'yearly') {
      dateFilter = "AND DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)";
    } else if (period === 'custom' && startDate && endDate) {
      dateFilter = `AND DATE(created_at) >= $${paramCount++} AND DATE(created_at) <= $${paramCount++}`;
      params.push(startDate);
      params.push(endDate);
    } else {
      // No date filter - all time
      dateFilter = '';
    }

    // Get revenue stats for vehicle records (customer_name = 'Kayıt')
    const query = `
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(total_price), 0) as total_revenue,
        COALESCE(AVG(total_price), 0) as avg_price
      FROM repair_quotes 
      WHERE customer_name = 'Kayıt'
      ${dateFilter}
    `;

    const result = await pool.query(query, params);
    const stats = result.rows[0];

    res.json({
      count: parseInt(stats.count) || 0,
      totalRevenue: parseFloat(stats.total_revenue) || 0,
      avgPrice: parseFloat(stats.avg_price) || 0
    });
  } catch (error) {
    next(error);
  }
};

export const cleanupOldRecords = async (req, res, next) => {
  try {
    // Delete all records that are NOT vehicle records (i.e., customer_name != 'Kayıt')
    const result = await pool.query(
      "DELETE FROM repair_quotes WHERE customer_name != 'Kayıt' OR customer_name IS NULL RETURNING *"
    );

    res.json({ 
      message: `Deleted ${result.rows.length} old records`,
      deleted: result.rows.length
    });
  } catch (error) {
    next(error);
  }
};

