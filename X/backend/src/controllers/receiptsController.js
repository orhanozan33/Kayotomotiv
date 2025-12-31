import pool from '../config/database.js';

export const createReceipt = async (req, res, next) => {
  try {
    const {
      customer_id,
      service_record_id,
      customer_name,
      customer_phone,
      customer_email,
      license_plate,
      service_name,
      service_description,
      service_type,
      price,
      performed_date,
      company_info
    } = req.body;

    const result = await pool.query(
      `INSERT INTO receipts (
        customer_id, service_record_id, customer_name, customer_phone, customer_email,
        license_plate, service_name, service_description, service_type, price,
        performed_date, company_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        customer_id || null,
        service_record_id || null,
        customer_name,
        customer_phone || null,
        customer_email || null,
        license_plate || null,
        service_name,
        service_description || null,
        service_type || null,
        price,
        performed_date,
        company_info ? JSON.stringify(company_info) : null
      ]
    );

    res.json({ receipt: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getReceipts = async (req, res, next) => {
  try {
    const { search } = req.query;
    
    let query = `
      SELECT * FROM receipts
    `;
    const params = [];
    
    if (search && search.trim()) {
      query += ` WHERE 
        customer_name ILIKE $1 OR
        customer_phone ILIKE $1 OR
        license_plate ILIKE $1 OR
        customer_email ILIKE $1
      `;
      params.push(`%${search.trim()}%`);
    }
    
    query += ` ORDER BY printed_at DESC LIMIT 500`;
    
    const result = await pool.query(query, params);
    res.json({ receipts: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getReceiptById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM receipts WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    res.json({ receipt: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM receipts WHERE id = $1', [id]);
    res.json({ message: 'Receipt deleted successfully' });
  } catch (error) {
    next(error);
  }
};

