import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { getPool } from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import { uploadImageToSupabase } from '@/lib/services/supabaseStorage';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const isProduction = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const formData = await request.formData();
    const file = formData.get('logo') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (2MB max for logo)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 });
    }

    let imageUrl: string;

    // Use Supabase Storage in production/Vercel, local file system in development
    const useSupabaseStorage = isProduction || process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (useSupabaseStorage) {
      try {
        const { url } = await uploadImageToSupabase(file, 'vehicle-images', 'company-logos');
        imageUrl = url;
      } catch (uploadError: any) {
        console.error('Supabase upload error:', uploadError);
        // Fallback to local storage if Supabase upload fails
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'logos');
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
        imageUrl = `/uploads/logos/${filename}`;
      }
    } else {
      // Local file system storage (development)
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'logos');
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
      imageUrl = `/uploads/logos/${filename}`;
    }

    // Save logo URL to settings
    await getPool().query(
      `INSERT INTO settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = NOW()`,
      ['company_logo_url', imageUrl]
    );

    return NextResponse.json({ logoUrl: imageUrl });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

