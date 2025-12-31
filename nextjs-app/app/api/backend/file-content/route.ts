import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireAdmin } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import fs from 'fs/promises';
import path from 'path';
import Joi from 'joi';

const isProduction = process.env.NODE_ENV === 'production';

const fileWriteSchema = Joi.object({
  filePath: Joi.string().required(),
  content: Joi.string().required(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    const rootDir = process.cwd(); // This is 'nextjs-app'
    const targetPath = path.join(rootDir, filePath);

    // Basic path validation to prevent directory traversal
    if (!targetPath.startsWith(rootDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const content = await fs.readFile(targetPath, 'utf-8');

    return NextResponse.json({ content });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const body = await request.json();
    const { error, value } = fileWriteSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const rootDir = process.cwd(); // This is 'nextjs-app'
    const targetPath = path.join(rootDir, value.filePath);

    // Basic path validation to prevent directory traversal
    if (!targetPath.startsWith(rootDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    await fs.writeFile(targetPath, value.content, 'utf-8');

    return NextResponse.json({ message: 'File saved successfully' });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

