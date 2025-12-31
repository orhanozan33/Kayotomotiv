import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import UserRepository from '@/lib/repositories/UserRepository';
import { generateToken } from '@/lib/utils/jwt';
import { handleError } from '@/lib/middleware/errorHandler';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  first_name: Joi.string().max(100).optional().allow(null, ''),
  last_name: Joi.string().max(100).optional().allow(null, ''),
  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .optional()
    .allow(null, ''),
  role: Joi.string().valid('customer', 'user', 'admin').default('customer'),
});

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const body = await request.json();

    const { error, value } = registerSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const existingUser = await UserRepository.findByEmail(value.email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const user = await UserRepository.create({
      email: value.email,
      password: value.password,
      firstName: value.first_name,
      lastName: value.last_name,
      phone: value.phone,
      role: value.role,
    });

    const token = generateToken(user.id);

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

