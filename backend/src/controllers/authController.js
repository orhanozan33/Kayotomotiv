import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      phone
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const user = await User.findByEmail(email);
      if (!user || !user.is_active) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await User.verifyPassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user.id);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        },
        token
      });
    } catch (dbError) {
      // Veritabanı hatalarını daha iyi handle et
      console.error('Database error in login:', dbError.message);
      console.error('Error code:', dbError.code);
      console.error('Error stack:', dbError.stack);
      
      // Tüm veritabanı hatalarını detaylı göster
      if (dbError.code === 'ECONNREFUSED' || dbError.code === 'ENOTFOUND' || dbError.code === 'ETIMEDOUT') {
        return res.status(500).json({ 
          error: 'Database connection failed',
          message: 'Unable to connect to database. Please check environment variables.',
          details: `DB_HOST: ${process.env.DB_HOST || 'NOT SET'}, DB_PORT: ${process.env.DB_PORT || 'NOT SET'}, DB_NAME: ${process.env.DB_NAME || 'NOT SET'}, DB_USER: ${process.env.DB_USER || 'NOT SET'}, DB_PASSWORD: ${process.env.DB_PASSWORD ? 'SET' : 'NOT SET'}`
        });
      }
      
      if (dbError.code === '42P01') {
        return res.status(500).json({
          error: 'Database schema not initialized',
          message: 'Users table does not exist. Please run migrations in Supabase.',
          details: dbError.message
        });
      }
      
      // JWT_SECRET kontrolü
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          error: 'JWT_SECRET missing',
          message: 'JWT_SECRET environment variable is not set in Vercel.'
        });
      }
      
      // Diğer hataları detaylı göster
      return res.status(500).json({
        error: 'Database error',
        message: dbError.message,
        code: dbError.code,
        details: process.env.NODE_ENV === 'production' ? 'Check Vercel logs for details' : dbError.stack
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, phone } = req.body;
    const updatedUser = await User.update(req.user.id, {
      first_name,
      last_name,
      phone
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};


