import pool from '../config/database.js';

class Vehicle {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.brand) {
      query += ` AND brand ILIKE $${paramCount++}`;
      params.push(`%${filters.brand}%`);
    }

    if (filters.model) {
      query += ` AND model ILIKE $${paramCount++}`;
      params.push(`%${filters.model}%`);
    }

    if (filters.year) {
      query += ` AND year = $${paramCount++}`;
      params.push(filters.year);
    }

    if (filters.minPrice) {
      query += ` AND price >= $${paramCount++}`;
      params.push(filters.minPrice);
    }

    if (filters.maxPrice) {
      query += ` AND price <= $${paramCount++}`;
      params.push(filters.maxPrice);
    }

    if (filters.status) {
      query += ` AND status = $${paramCount++}`;
      params.push(filters.status);
    } else if (filters.excludeSold !== false) {
      // If no status filter and excludeSold is true (default), show available and reserved vehicles (but not sold)
      query += ` AND (status = 'available' OR status = 'reserved')`;
    }
    // If excludeSold is false, don't filter by status (allows finding any vehicle for image matching)

    // Additional sold filter if excludeSold is explicitly true
    if (filters.excludeSold === true) {
      query += ` AND status != 'sold'`;
    }

    if (filters.featured !== undefined) {
      query += ` AND featured = $${paramCount++}`;
      params.push(filters.featured);
    }

    query += ' ORDER BY created_at DESC';

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
    const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(data) {
    const {
      brand, model, year, price, mileage, fuel_type, transmission,
      color, description, status = 'available', featured = false, created_by
    } = data;

    const result = await pool.query(
      `INSERT INTO vehicles (brand, model, year, price, mileage, fuel_type, transmission, 
       color, description, status, featured, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [brand, model, year, price, mileage, fuel_type, transmission, color, description, status, featured, created_by]
    );

    return result.rows[0];
  }

  static async update(id, data) {
    const allowedFields = [
      'brand', 'model', 'year', 'price', 'mileage', 'fuel_type', 'transmission',
      'color', 'description', 'status', 'featured'
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
      `UPDATE vehicles SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
  }

  static async getImages(vehicleId) {
    const result = await pool.query(
      'SELECT * FROM vehicle_images WHERE vehicle_id = $1 ORDER BY display_order, created_at',
      [vehicleId]
    );
    return result.rows;
  }

  static async addImage(vehicleId, imageUrl, isPrimary = false) {
    // If setting as primary, unset all other primary images first
    if (isPrimary) {
      await pool.query('UPDATE vehicle_images SET is_primary = false WHERE vehicle_id = $1', [vehicleId]);
    }
    
    // Get max display_order for this vehicle
    const orderResult = await pool.query(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM vehicle_images WHERE vehicle_id = $1',
      [vehicleId]
    );
    const displayOrder = orderResult.rows[0].next_order;

    const result = await pool.query(
      `INSERT INTO vehicle_images (vehicle_id, image_url, is_primary, display_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [vehicleId, imageUrl, isPrimary, displayOrder]
    );
    return result.rows[0];
  }

  static async deleteImage(imageId) {
    await pool.query('DELETE FROM vehicle_images WHERE id = $1', [imageId]);
  }

  static async updateImage(imageId, updates) {
    const allowedFields = ['is_primary', 'display_order'];
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return await pool.query('SELECT * FROM vehicle_images WHERE id = $1', [imageId]).then(r => r.rows[0]);
    }

    // If setting as primary, unset all other primary images for this vehicle first
    if (updates.is_primary === true) {
      const imageResult = await pool.query('SELECT vehicle_id FROM vehicle_images WHERE id = $1', [imageId]);
      if (imageResult.rows.length > 0) {
        const vehicleId = imageResult.rows[0].vehicle_id;
        await pool.query('UPDATE vehicle_images SET is_primary = false WHERE vehicle_id = $1 AND id != $2', [vehicleId, imageId]);
      }
    }

    values.push(imageId);
    const result = await pool.query(
      `UPDATE vehicle_images SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async updateImagesOrder(imageOrders) {
    // imageOrders should be an array of { imageId, display_order }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const { imageId, display_order } of imageOrders) {
        await client.query('UPDATE vehicle_images SET display_order = $1 WHERE id = $2', [display_order, imageId]);
      }
      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default Vehicle;


