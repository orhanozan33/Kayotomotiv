// Vercel serverless function wrapper for Express app
import app from '../src/server.js';

// Vercel serverless function handler
// Vercel serverless functions need explicit handler
export default async (req, res) => {
  // Handle the request with Express app
  return app(req, res);
};

