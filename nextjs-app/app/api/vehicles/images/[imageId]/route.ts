import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import VehicleRepository from '@/lib/repositories/VehicleRepository';
import { authenticate, requireAdmin } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { resolveParams } from '@/lib/utils/routeParams';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const updateImageSchema = Joi.object({
  is_primary: Joi.boolean().optional(),
  display_order: Joi.number().integer().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> | { imageId: string } }
) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const resolvedParams = await resolveParams(params);
    const body = await request.json();
    const { error, value } = updateImageSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const updates: { isPrimary?: boolean; displayOrder?: number } = {};
    if (value.is_primary !== undefined) {
      updates.isPrimary = value.is_primary;
    }
    if (value.display_order !== undefined) {
      updates.displayOrder = value.display_order;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const image = await VehicleRepository.updateImage(resolvedParams.imageId, updates);
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Map TypeORM entity to frontend format
    let imageUrl = image.imageUrl;
    if (imageUrl && !imageUrl.startsWith('/uploads') && !imageUrl.startsWith('http')) {
      imageUrl = imageUrl.startsWith('/') ? imageUrl : `/uploads/${imageUrl}`;
    }

    return NextResponse.json({
      image: {
        id: image.id,
        vehicle_id: image.vehicleId,
        image_url: imageUrl,
        is_primary: image.isPrimary,
        display_order: image.displayOrder,
        created_at: image.createdAt,
      },
    });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> | { imageId: string } }
) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const resolvedParams = await resolveParams(params);
    await VehicleRepository.deleteImage(resolvedParams.imageId);
    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

