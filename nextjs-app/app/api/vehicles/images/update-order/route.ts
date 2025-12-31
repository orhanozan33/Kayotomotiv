import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import VehicleRepository from '@/lib/repositories/VehicleRepository';
import { authenticate, requireAdmin } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const updateOrderSchema = Joi.object({
  imageOrders: Joi.array()
    .items(
      Joi.object({
        imageId: Joi.string().uuid().required(),
        display_order: Joi.number().integer().required(),
      })
    )
    .required(),
});

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const body = await request.json();
    const { error, value } = updateOrderSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    // Map frontend format to repository format
    const imageOrders = value.imageOrders.map((item: any) => ({
      imageId: item.imageId,
      display_order: item.display_order,
    }));

    await VehicleRepository.updateImagesOrder(imageOrders);
    return NextResponse.json({ message: 'Images order updated successfully' });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

