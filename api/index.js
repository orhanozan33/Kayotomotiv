// Vercel serverless function wrapper for Express app
import app from '../backend/src/server.js';

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    console.log('📥 Backend API Request:', req.method, req.url);
    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error('❌ Backend API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }
}
