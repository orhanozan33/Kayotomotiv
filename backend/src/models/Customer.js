import pool from '../config/database.js';

class Customer {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.search) {
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR phone ILIKE $${paramCount} OR license_plate ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY last_name, first_name';

    if (filters.limit) {
      query += ` LIMIT $${paramCount++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount++}`;
      params.push(filters.offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(data) {
    const {
      first_name, last_name, email, phone, address,
      vehicle_brand, vehicle_model, vehicle_year, license_plate, notes, created_by
    } = data;

    // Validate required fields
    if (!first_name || !last_name) {
      throw new Error('First name and last name are required');
    }

    const result = await pool.query(
      `INSERT INTO customers 
       (first_name, last_name, email, phone, address, vehicle_brand, vehicle_model, vehicle_year, license_plate, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        first_name.trim(),
        last_name.trim(),
        email?.trim() || null,
        phone?.trim() || null,
        address?.trim() || null,
        vehicle_brand?.trim() || null,
        vehicle_model?.trim() || null,
        vehicle_year || null,
        license_plate?.trim() || null,
        notes?.trim() || null,
        created_by
      ]
    );

    return result.rows[0];
  }

  static async update(id, data) {
    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone', 'address',
      'vehicle_brand', 'vehicle_model', 'vehicle_year', 'license_plate', 'notes'
    ];
    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE customers SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM customers WHERE id = $1', [id]);
  }

  static async getVehicles(customerId) {
    const result = await pool.query(
      'SELECT * FROM customer_vehicles WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    );
    return result.rows;
  }

  static async addVehicle(customerId, data) {
    const {
      brand, model, year, license_plate, vin, color, mileage, notes
    } = data;

    // Validate required fields
    if (!brand || !brand.trim()) {
      throw new Error('Marka gereklidir');
    }
    if (!model || !model.trim()) {
      throw new Error('Model gereklidir');
    }

    // Validate customer ID
    if (!customerId) {
      throw new Error('Müşteri ID gereklidir');
    }

    // Convert year and mileage to integers, handle NaN
    const yearValue = year ? (isNaN(parseInt(year)) ? null : parseInt(year)) : null;
    const mileageValue = mileage ? (isNaN(parseInt(mileage)) ? null : parseInt(mileage)) : null;

    const result = await pool.query(
      `INSERT INTO customer_vehicles 
       (customer_id, brand, model, year, license_plate, vin, color, mileage, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        customerId, 
        brand.trim(), 
        model.trim(), 
        yearValue, 
        license_plate?.trim() || null, 
        vin?.trim() || null, 
        color?.trim() || null, 
        mileageValue, 
        notes?.trim() || null
      ]
    );

    return result.rows[0];
  }

  static async getServiceRecords(customerId) {
    const result = await pool.query(
      `SELECT sr.*, u.first_name as performed_by_first_name, u.last_name as performed_by_last_name
       FROM service_records sr
       LEFT JOIN users u ON sr.performed_by = u.id
       WHERE sr.customer_id = $1
       ORDER BY sr.performed_date DESC, sr.created_at DESC`,
      [customerId]
    );
    return result.rows;
  }

  static async addServiceRecord(data) {
    const {
      customer_id, vehicle_id, service_type, service_name, service_description,
      price, performed_date, performed_by, notes, quote_id, appointment_id, car_wash_appointment_id
    } = data;

    const result = await pool.query(
      `INSERT INTO service_records 
       (customer_id, vehicle_id, service_type, service_name, service_description,
        price, performed_date, performed_by, notes, quote_id, appointment_id, car_wash_appointment_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [customer_id, vehicle_id, service_type, service_name, service_description,
       price, performed_date, performed_by, notes, quote_id, appointment_id, car_wash_appointment_id]
    );

    return result.rows[0];
  }

  static async updateServiceRecord(id, data) {
    const allowedFields = [
      'vehicle_id', 'service_type', 'service_name', 'service_description',
      'price', 'performed_date', 'performed_by', 'notes'
    ];
    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      const result = await pool.query('SELECT * FROM service_records WHERE id = $1', [id]);
      return result.rows[0];
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE service_records SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async deleteServiceRecord(id) {
    await pool.query('DELETE FROM service_records WHERE id = $1', [id]);
  }

  static async getStats(customerId) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_services,
        COALESCE(SUM(price), 0) as total_spent,
        MIN(performed_date) as first_service_date,
        MAX(performed_date) as last_service_date
       FROM service_records
       WHERE customer_id = $1`,
      [customerId]
    );
    return result.rows[0];
  }
}

export default Customer;

