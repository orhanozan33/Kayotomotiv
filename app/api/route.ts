// Next.js API Route - Root /api endpoint
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Kayotomotiv API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      reservations: '/api/reservations',
      repair: '/api/repair',
      carWash: '/api/car-wash',
      pages: '/api/pages',
      customers: '/api/customers',
      settings: '/api/settings'
    },
    timestamp: new Date().toISOString()
  });
}

