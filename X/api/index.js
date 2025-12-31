// Vercel serverless function wrapper for Express app
import app from '../backend/src/server.js';

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    console.log('📥 Backend API Request:', req.method, req.url);
    // Avoid logging headers (may contain Authorization tokens) in production logs.
    
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
