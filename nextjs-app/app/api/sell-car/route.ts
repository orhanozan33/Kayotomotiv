import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { getPool } from '@/lib/config/database';
import { authenticate, requireAdmin } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { uploadImageToSupabase } from '@/lib/services/supabaseStorage';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const isProduction = process.env.NODE_ENV === 'production';
const useSupabaseStorage = isProduction || !!process.env.NEXT_PUBLIC_SUPABASE_URL;

// POST - Public endpoint for form submission
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const formData = await request.formData();

    const brand = formData.get('brand') as string;
    const model = formData.get('model') as string;
    const year = formData.get('year') as string;
    const transmission = formData.get('transmission') as string;
    const fuelType = formData.get('fuelType') as string;
    const mileage = formData.get('mileage') as string || null;
    const customerName = formData.get('customerName') as string;
    const customerEmail = formData.get('customerEmail') as string;
    const customerPhone = formData.get('customerPhone') as string;
    const notes = formData.get('notes') as string || '';
    const images = formData.getAll('images') as File[];

    // Validation
    if (!brand || !model || !year || !transmission || !fuelType) {
      return NextResponse.json({ error: 'Tüm araç bilgileri zorunludur' }, { status: 400 });
    }

    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: 'İletişim bilgileri zorunludur' }, { status: 400 });
    }

    // Save images - Use Supabase Storage in production/Vercel, local file system in development
    const imageUrls: string[] = [];

    for (const image of images) {
      if (image && image.size > 0) {
        let imageUrl: string;

        if (useSupabaseStorage) {
          try {
            const { url } = await uploadImageToSupabase(image, 'vehicle-images', 'sell-car');
            imageUrl = url;
          } catch (uploadError: any) {
            console.error('Supabase upload error:', uploadError);
            // Fallback to local storage if Supabase upload fails (development only)
            if (!isProduction) {
              const uploadDir = join(process.cwd(), 'public', 'uploads', 'sell-car');
              if (!existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
              }
              const timestamp = Date.now();
              const filename = `${timestamp}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
              const filepath = join(uploadDir, filename);
              const bytes = await image.arrayBuffer();
              const buffer = Buffer.from(bytes);
              await writeFile(filepath, buffer);
              imageUrl = `/uploads/sell-car/${filename}`;
            } else {
              throw new Error(`Failed to upload image: ${uploadError.message}`);
            }
          }
        } else {
          // Local file system storage (development)
          const uploadDir = join(process.cwd(), 'public', 'uploads', 'sell-car');
          if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
          }
          const timestamp = Date.now();
          const filename = `${timestamp}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filepath = join(uploadDir, filename);
          const bytes = await image.arrayBuffer();
          const buffer = Buffer.from(bytes);
          await writeFile(filepath, buffer);
          imageUrl = `/uploads/sell-car/${filename}`;
        }

        imageUrls.push(imageUrl);
      }
    }

    // Insert into database
    const result = await getPool().query(
      `INSERT INTO sell_car_submissions 
       (brand, model, year, transmission, fuel_type, mileage, customer_name, customer_email, customer_phone, notes, images, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'unread', CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        brand,
        model,
        parseInt(year),
        transmission,
        fuelType,
        mileage ? parseInt(mileage) : null,
        customerName,
        customerEmail,
        customerPhone,
        notes,
        JSON.stringify(imageUrls),
      ]
    );

    return NextResponse.json({ message: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

// GET - Admin only endpoint to get all submissions
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = 'SELECT * FROM sell_car_submissions WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (status && status !== 'all') {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    if (search && search.trim()) {
      query += ` AND (
        customer_name ILIKE $${paramCount} OR
        customer_email ILIKE $${paramCount} OR
        brand ILIKE $${paramCount} OR
        model ILIKE $${paramCount}
      )`;
      params.push(`%${search.trim()}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await getPool().query(query, params);

    // Count total submissions
    const totalResult = await getPool().query('SELECT COUNT(*) as total FROM sell_car_submissions');
    const total = parseInt(totalResult.rows[0].total);

    return NextResponse.json({ submissions: result.rows, total });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}
