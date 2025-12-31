import pool from './database';

// PostgreSQL Pool wrapper
export const db = {
  query: async (text: string, params?: any[]) => {
    try {
      return await pool.query(text, params);
    } catch (error) {
      console.error('❌ PostgreSQL query error:', error);
      throw error;
    }
  },
  connect: () => pool.connect(),
  end: () => pool.end(),
};

interface VehicleFilters {
  brand?: string;
  model?: string;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  excludeSold?: boolean;
}

// PostgreSQL API wrapper
export const dbApi = {
  // Vehicles
  getVehicles: async (filters: VehicleFilters = {}) => {
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.brand) {
      query += ` AND brand ILIKE $${paramIndex}`;
      params.push(`%${filters.brand}%`);
      paramIndex++;
    }
    if (filters.model) {
      query += ` AND model ILIKE $${paramIndex}`;
      params.push(`%${filters.model}%`);
      paramIndex++;
    }
    if (filters.year) {
      query += ` AND year = $${paramIndex}`;
      params.push(filters.year);
      paramIndex++;
    }
    if (filters.minPrice) {
      query += ` AND price >= $${paramIndex}`;
      params.push(filters.minPrice);
      paramIndex++;
    }
    if (filters.maxPrice) {
      query += ` AND price <= $${paramIndex}`;
      params.push(filters.maxPrice);
      paramIndex++;
    }
    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.excludeSold !== false) {
      query += ` AND status IN ('available', 'reserved')`;
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
      if (filters.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(filters.offset);
      }
    }

    const result = await pool.query(query, params);
    return result.rows || [];
  },

  getVehicleById: async (id: string) => {
    const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  getVehicleImages: async (vehicleId: string) => {
    const result = await pool.query(
      'SELECT * FROM vehicle_images WHERE vehicle_id = $1 ORDER BY display_order ASC',
      [vehicleId]
    );
    return result.rows || [];
  },

  // Users
  getUserByEmail: async (email: string) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  // Settings
  getSettings: async () => {
    try {
      const result = await pool.query('SELECT key, value FROM settings');
      const settings: Record<string, string> = {};
      result.rows.forEach((row: any) => {
        settings[row.key] = row.value;
      });
      return settings;
    } catch (error: any) {
      // If table doesn't exist, return empty settings
      if (error.code === '42P01') {
        console.warn('⚠️  Settings table does not exist yet, returning empty settings');
        return {} as Record<string, string>;
      }
      throw error;
    }
  },

  getSettingsByKeys: async (keys: string[]) => {
    try {
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const result = await pool.query(
        `SELECT key, value FROM settings WHERE key IN (${placeholders})`,
        keys
      );
      const settings: Record<string, string> = {};
      result.rows.forEach((row: any) => {
        settings[row.key] = row.value;
      });
      return settings;
    } catch (error: any) {
      // If table doesn't exist, return empty settings
      if (error.code === '42P01') {
        console.warn('⚠️  Settings table does not exist yet, returning empty settings');
        return {} as Record<string, string>;
      }
      throw error;
    }
  },

  updateSetting: async (key: string, value: string) => {
    const result = await pool.query(
      `INSERT INTO settings (key, value, updated_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = NOW() 
       RETURNING *`,
      [key, value]
    );
    return result.rows[0];
  },

  updateSettings: async (settingsObj: Record<string, string>) => {
    const updates = Object.entries(settingsObj);
    const results = [];
    
    for (const [key, value] of updates) {
      const result = await pool.query(
        `INSERT INTO settings (key, value, updated_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (key) 
         DO UPDATE SET value = $2, updated_at = NOW() 
         RETURNING *`,
        [key, value || '']
      );
      results.push(result.rows[0]);
    }
    
    return results;
  },
};

