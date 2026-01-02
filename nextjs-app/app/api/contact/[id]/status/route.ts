import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { getPool } from '@/lib/config/database';
import { authenticate, requireAdmin } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { resolveParams } from '@/lib/utils/routeParams';
import Joi from 'joi';

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const isProduction = process.env.NODE_ENV === 'production';

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('unread', 'read', 'replied').required(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    console.log('🚀 PUT /api/contact/[id]/status - Starting...');
    await initializeDatabase();
    console.log('✅ Database initialized');
    
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const resolvedParams = await resolveParams(params);
    const body = await request.json();
    const { error, value } = updateStatusSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    console.log('🔍 Updating message status:', { id: resolvedParams.id, status: value.status });
    const result = await getPool().query(
      `UPDATE contact_messages 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [value.status, resolvedParams.id]
    );

    if (result.rows.length === 0) {
      console.warn('⚠️ Message not found:', resolvedParams.id);
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    console.log('✅ Message status updated successfully');
    return NextResponse.json({ message: result.rows[0] });
  } catch (error: any) {
    console.error('❌ PUT /api/contact/[id]/status - Error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    });
    return handleError(error, isProduction);
  }
}

