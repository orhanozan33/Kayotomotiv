// User model for Next.js
import pool from '../db';
import bcrypt from 'bcryptjs';

export class User {
  static async findByEmail(email: string) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async verifyPassword(user: any, password: string) {
    return await bcrypt.compare(password, user.password_hash);
  }
}

