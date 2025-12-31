import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireAdmin } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import fs from 'fs/promises';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const { searchParams } = new URL(request.url);
    const directory = searchParams.get('directory') || 'src'; // Default to 'src'

    const rootDir = process.cwd(); // This is 'nextjs-app'
    const targetPath = path.join(rootDir, directory);

    // Basic path validation to prevent directory traversal
    if (!targetPath.startsWith(rootDir)) {
      return NextResponse.json({ error: 'Invalid directory path' }, { status: 400 });
    }

    const dirents = await fs.readdir(targetPath, { withFileTypes: true });

    const files = dirents.map(dirent => ({
      name: dirent.name,
      type: dirent.isDirectory() ? 'directory' : 'file',
      path: path.join(directory, dirent.name).replace(/\\/g, '/'), // Normalize path for consistency
    }));

    return NextResponse.json({ files });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

