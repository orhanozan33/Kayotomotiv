import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import VehicleRepository from '@/lib/repositories/VehicleRepository';
import { authenticate, requireAdmin } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';

const isProduction = process.env.NODE_ENV === 'production';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await initializeDatabase();
    const resolvedParams = await Promise.resolve(params);
    const vehicle = await VehicleRepository.findById(resolvedParams.id);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const images = vehicle.images || await VehicleRepository.getImages(vehicle.id);
    // Map TypeORM entity fields to frontend expected format
    const plainImages = images.map((img: any) => {
      // Ensure image URL is in correct format for Next.js public folder
      let imageUrl = img.imageUrl;
      // If imageUrl doesn't start with /uploads, prepend it
      if (imageUrl && !imageUrl.startsWith('/uploads') && !imageUrl.startsWith('http')) {
        imageUrl = imageUrl.startsWith('/') ? imageUrl : `/uploads/${imageUrl}`;
      }
      return {
        id: img.id,
        vehicle_id: img.vehicleId,
        image_url: imageUrl,
        is_primary: img.isPrimary,
        display_order: img.displayOrder,
        created_at: img.createdAt,
      };
    });
    return NextResponse.json({
      vehicle: {
        ...vehicle,
        fuel_type: vehicle.fuelType,
        reservation_end_time: vehicle.reservationEndTime,
        images: plainImages,
      },
    });
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
    
    // Filter out undefined and null values, and map frontend fields to entity fields
    const updateData: any = {};
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.model !== undefined) updateData.model = body.model;
    if (body.year !== undefined) updateData.year = body.year;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.mileage !== undefined) updateData.mileage = body.mileage;
    if (body.fuel_type !== undefined) updateData.fuelType = body.fuel_type;
    if (body.transmission !== undefined) updateData.transmission = body.transmission;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.reservation_end_time !== undefined) updateData.reservationEndTime = body.reservation_end_time;
    
    // Check if there's any data to update
    if (Object.keys(updateData).length === 0) {
      // No data to update, just return the current vehicle
      const vehicle = await VehicleRepository.findById(resolvedParams.id);
      if (!vehicle) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
      }
      return NextResponse.json({ vehicle });
    }
    
    const vehicle = await VehicleRepository.update(resolvedParams.id, updateData);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json({ vehicle });
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
    await VehicleRepository.delete(resolvedParams.id);
    return NextResponse.json({ message: 'Vehicle deleted successfully' });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

