import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { dbApi } from '@/lib/config/database-api';
import { handleError } from '@/lib/middleware/errorHandler';

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const isProduction = process.env.NODE_ENV === 'production';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const settings = await dbApi.getSettingsByKeys([
      'facebook_url',
      'instagram_url',
      'x_url',
      'phone_number',
    ]);

    const links = {
      facebook: settings.facebook_url || '',
      instagram: settings.instagram_url || '',
      x: settings.x_url || '',
      phone: settings.phone_number || '',
    };

    return NextResponse.json({ links });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

