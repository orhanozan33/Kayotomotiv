import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, phone, role, is_active, created_at 
       FROM users 
       WHERE role IN ('admin', 'user')
       ORDER BY created_at DESC`
    );
    res.json({ users: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, phone, role, is_active, created_at 
       FROM users 
       WHERE id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user permissions
    const permissionsResult = await pool.query(
      'SELECT * FROM user_permissions WHERE user_id = $1',
      [req.params.id]
    );
    
    res.json({ 
      user: result.rows[0],
      permissions: permissionsResult.rows
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, phone, role = 'user' } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check if user exists (case-insensitive email check)
    const existingUser = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Bu email adresi zaten kullanılıyor' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, email, first_name, last_name, phone, role, is_active, created_at`,
      [email, passwordHash, first_name || null, last_name || null, phone || null, role]
    );
    
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, phone, role, is_active } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (email !== undefined) {
      // Check if email is taken by another user
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.params.id]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    
    if (password !== undefined && password.trim()) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramCount++}`);
      values.push(passwordHash);
    }
    
    if (first_name !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(first_name);
    }
    
    if (last_name !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(last_name);
    }
    
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    
    if (role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING id, email, first_name, last_name, phone, role, is_active, updated_at`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    // Don't allow deleting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Kendi hesabınızı silemezsiniz' });
    }
    
    // Check if user exists first
    const userCheck = await pool.query('SELECT id, role FROM users WHERE id = $1', [req.params.id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Delete user permissions first (CASCADE should handle this, but let's be explicit)
    await pool.query('DELETE FROM user_permissions WHERE user_id = $1', [req.params.id]);
    
    // Delete user
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı silinirken hata oluştu' });
    }
    
    res.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Bu kullanıcı başka kayıtlarda kullanıldığı için silinemez' });
    }
    next(error);
  }
};

