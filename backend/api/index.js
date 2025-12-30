// Vercel serverless function wrapper for Express app
import app from '../src/server.js';

// Vercel serverless function handler
export default async (req, res) => {
  try {
    console.log('📥 Backend API Request:', req.method, req.url);
    // Handle the request with Express app
    await app(req, res);
  } catch (error) {
    console.error('❌ Backend API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }
};
