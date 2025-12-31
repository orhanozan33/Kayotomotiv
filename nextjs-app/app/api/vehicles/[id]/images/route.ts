import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import VehicleRepository from '@/lib/repositories/VehicleRepository';
import { authenticate, requireAdmin } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { resolveParams } from '@/lib/utils/routeParams';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const isProduction = process.env.NODE_ENV === 'production';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const resolvedParams = await resolveParams(params);
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const isPrimary = formData.get('is_primary') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Save file to uploads directory
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = file.name.split('.').pop();
    const filename = `${uniqueSuffix}.${fileExtension}`;
    const filepath = join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/${filename}`;

    // Add image to database
    const image = await VehicleRepository.addImage(resolvedParams.id, imageUrl, isPrimary);

    // Map TypeORM entity to frontend format
    return NextResponse.json({
      image: {
        id: image.id,
        vehicle_id: image.vehicleId,
        image_url: imageUrl,
        is_primary: image.isPrimary,
        display_order: image.displayOrder,
        created_at: image.createdAt,
      },
    }, { status: 201 });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

