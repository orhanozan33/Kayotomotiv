import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import UserRepository from '@/lib/repositories/UserRepository';
import { generateToken } from '@/lib/utils/jwt';
import { handleError } from '@/lib/middleware/errorHandler';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const body = await request.json();

    const { error, value } = loginSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const user = await UserRepository.findByEmail(value.email);
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await user.verifyPassword(value.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken(user.id);

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
      },
      token,
    });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

