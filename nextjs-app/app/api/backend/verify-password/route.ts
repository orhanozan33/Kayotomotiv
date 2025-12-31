import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { verifyBackendPassword, generateBackendToken } from '@/lib/utils/security';
import { handleError } from '@/lib/middleware/errorHandler';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const verifyPasswordSchema = Joi.object({
  password: Joi.string().required(),
});

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const body = await request.json();
    const { error, value } = verifyPasswordSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const BACKEND_PASSWORD_HASH = process.env.BACKEND_PASSWORD_HASH;
    if (!BACKEND_PASSWORD_HASH) {
      console.error('BACKEND_PASSWORD_HASH environment variable ayarlanmamış');
      return NextResponse.json({ error: 'Sunucu yapılandırma hatası' }, { status: 500 });
    }

    const isValid = await verifyBackendPassword(value.password, BACKEND_PASSWORD_HASH);
    
    if (isValid) {
      const token = generateBackendToken();
      return NextResponse.json({ success: true, token });
    }
    
    return NextResponse.json({ error: 'Geçersiz şifre' }, { status: 401 });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

