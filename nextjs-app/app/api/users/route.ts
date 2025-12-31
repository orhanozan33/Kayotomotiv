import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import UserRepository from '@/lib/repositories/UserRepository';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().allow('', null).optional(),
  last_name: Joi.string().allow('', null).optional(),
  phone: Joi.string().allow('', null).optional(),
  role: Joi.string().valid('admin', 'user').default('user'),
});

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const users = await UserRepository.findAll();
    return NextResponse.json({ users });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const body = await request.json();
    const { error, value } = createUserSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const existingUser = await UserRepository.findByEmail(value.email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const user = await UserRepository.create({
      email: value.email.trim().toLowerCase(),
      password: value.password,
      firstName: value.first_name || null,
      lastName: value.last_name || null,
      phone: value.phone || null,
      role: value.role || 'user',
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

