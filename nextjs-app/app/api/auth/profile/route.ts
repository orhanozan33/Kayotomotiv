import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import UserRepository from '@/lib/repositories/UserRepository';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const updateProfileSchema = Joi.object({
  first_name: Joi.string().max(100).optional().allow(null, ''),
  last_name: Joi.string().max(100).optional().allow(null, ''),
  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .optional()
    .allow(null, ''),
});

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const user = await UserRepository.findById(authResult.user!.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { error, value } = updateProfileSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const updatedUser = await UserRepository.update(authResult.user!.id, {
      firstName: value.first_name,
      lastName: value.last_name,
      phone: value.phone,
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

