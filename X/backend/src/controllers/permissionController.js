import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export const getUserPermissions = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_permissions WHERE user_id = $1',
      [req.params.userId]
    );
    res.json({ permissions: result.rows });
  } catch (error) {
    next(error);
  }
};

export const updateUserPermissions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body; // Array of permission objects
    
    // Verify user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete existing permissions for this user
    await pool.query('DELETE FROM user_permissions WHERE user_id = $1', [userId]);
    
    // Insert new permissions
    const availablePages = [
      'vehicles', 'customers', 'repair-services', 'repair-quotes', 
      'car-wash', 'reservations', 'pages'
    ];
    
    for (const perm of permissions) {
      if (!availablePages.includes(perm.page)) {
        continue; // Skip invalid pages
      }
      
      let permissionPassword = null;
      if (perm.permission_password && perm.permission_password.trim()) {
        permissionPassword = await bcrypt.hash(perm.permission_password, 10);
      }
      
      await pool.query(
        `INSERT INTO user_permissions 
         (user_id, page, can_view, can_add, can_edit, can_delete, permission_password)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          perm.page,
          perm.can_view || false,
          perm.can_add || false,
          perm.can_edit || false,
          perm.can_delete || false,
          permissionPassword
        ]
      );
    }
    
    // Return updated permissions
    const result = await pool.query(
      'SELECT * FROM user_permissions WHERE user_id = $1',
      [userId]
    );
    
    res.json({ permissions: result.rows });
  } catch (error) {
    next(error);
  }
};

export const verifyPermissionPassword = async (req, res, next) => {
  try {
    const { userId, page, password } = req.body;
    
    const result = await pool.query(
      'SELECT permission_password FROM user_permissions WHERE user_id = $1 AND page = $2',
      [userId, page]
    );
    
    if (result.rows.length === 0 || !result.rows[0].permission_password) {
      return res.status(404).json({ error: 'Permission password not set' });
    }
    
    const isValid = await bcrypt.compare(password, result.rows[0].permission_password);
    
    res.json({ valid: isValid });
  } catch (error) {
    next(error);
  }
};

