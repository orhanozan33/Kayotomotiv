import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and keys from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not set. Image uploads will fail.');
}

// Create Supabase client for server-side operations
// Use service role key if available, otherwise use anon key
export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Upload image to Supabase Storage
export async function uploadImageToSupabase(
  file: File,
  bucket: string = 'vehicle-images',
  folder: string = 'vehicles'
): Promise<{ url: string; path: string }> {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Check environment variables.');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only image files are allowed');
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  // Generate unique filename
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const filename = `${folder}/${uniqueSuffix}.${fileExtension}`;

  // Convert file to ArrayBuffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

// Delete image from Supabase Storage
export async function deleteImageFromSupabase(
  path: string,
  bucket: string = 'vehicle-images'
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Check environment variables.');
  }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

