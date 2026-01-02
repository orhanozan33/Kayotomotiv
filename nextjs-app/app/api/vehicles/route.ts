import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import VehicleRepository, { VehicleFilters } from '@/lib/repositories/VehicleRepository';
import { authenticate, requireAdmin } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const isProduction = process.env.NODE_ENV === 'production';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 GET /api/vehicles - Starting...');
    console.log('🔍 Environment check:', {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      nodeEnv: process.env.NODE_ENV,
      isVercel: Boolean(process.env.VERCEL),
    });
    
    await initializeDatabase();
    console.log('✅ Database initialized');
    const { searchParams } = new URL(request.url);

    const filters: VehicleFilters = {
      brand: searchParams.get('brand') || undefined,
      model: searchParams.get('model') || undefined,
      year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
      minPrice: searchParams.get('minPrice')
        ? parseFloat(searchParams.get('minPrice')!)
        : undefined,
      maxPrice: searchParams.get('maxPrice')
        ? parseFloat(searchParams.get('maxPrice')!)
        : undefined,
      status: searchParams.get('status') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      excludeSold: searchParams.get('excludeSold') !== 'false',
    };

    // Use TypeORM repository directly
    console.log('🔍 Fetching vehicles with filters:', filters);
    const vehicles = await VehicleRepository.findAll(filters);
    console.log(`✅ Found ${vehicles.length} vehicles`);

    // Get images for each vehicle and map fields for frontend compatibility
    const vehiclesWithImages = await Promise.all(
      vehicles.map(async (vehicle: any) => {
        try {
          const images = await VehicleRepository.getImages(vehicle.id);
          // Convert TypeORM entities to plain objects
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
          // Map TypeORM entity fields to frontend expected format
          return {
            ...vehicle,
            fuel_type: vehicle.fuelType || vehicle.fuel_type,
            reservation_end_time: vehicle.reservationEndTime || vehicle.reservation_end_time,
            images: plainImages || [],
          };
        } catch (imageError) {
          console.warn('⚠️  Error loading images for vehicle', vehicle.id, ':', imageError);
          return {
            ...vehicle,
            fuel_type: vehicle.fuelType || vehicle.fuel_type,
            reservation_end_time: vehicle.reservationEndTime || vehicle.reservation_end_time,
            images: [],
          };
        }
      })
    );

    console.log(`✅ Returning ${vehiclesWithImages.length} vehicles with images`);
    return NextResponse.json({ vehicles: vehiclesWithImages });
  } catch (error: any) {
    console.error('❌ GET /api/vehicles - Error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    });
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
    const vehicleData = {
      ...body,
      createdBy: authResult.user!.id,
      fuelType: body.fuel_type,
    };

    const vehicle = await VehicleRepository.create(vehicleData);
    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

