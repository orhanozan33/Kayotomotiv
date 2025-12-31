import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import UserRepository from '@/lib/repositories/UserRepository';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  first_name: Joi.string().allow('', null).optional(),
  last_name: Joi.string().allow('', null).optional(),
  phone: Joi.string().allow('', null).optional(),
  role: Joi.string().valid('admin', 'user').optional(),
  is_active: Joi.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const resolvedParams = await Promise.resolve(params);
    const user = await UserRepository.findById(resolvedParams.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const resolvedParams = await Promise.resolve(params);
    const body = await request.json();
    const { error, value } = updateUserSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const updateData: any = {};
    if (value.email !== undefined) updateData.email = value.email.trim().toLowerCase();
    if (value.password !== undefined) updateData.password = value.password;
    if (value.first_name !== undefined) updateData.firstName = value.first_name;
    if (value.last_name !== undefined) updateData.lastName = value.last_name;
    if (value.phone !== undefined) updateData.phone = value.phone;
    if (value.role !== undefined) updateData.role = value.role;
    if (value.is_active !== undefined) updateData.isActive = value.is_active;

    const user = await UserRepository.update(resolvedParams.id, updateData);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const resolvedParams = await Promise.resolve(params);
    const user = await UserRepository.findById(resolvedParams.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await UserRepository.delete(resolvedParams.id);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

