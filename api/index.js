// Vercel serverless function wrapper for Express app
import app from '../backend/src/server.js';

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    console.log('📥 Backend API Request:', req.method, req.url);
    console.log('📥 Request headers:', JSON.stringify(req.headers));
    console.log('📥 Environment check:', {
      DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
      DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET',
      DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET',
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV
    });
    
    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error('❌ Backend API Error:', error);
    console.error('❌ Error stack:', error.stack);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
      });
    }
  }
}
