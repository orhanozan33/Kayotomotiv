import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import pool from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import Joi from 'joi';
import bcrypt from 'bcryptjs';

const isProduction = process.env.NODE_ENV === 'production';

const updatePermissionsSchema = Joi.object({
  permissions: Joi.array().items(
    Joi.object({
      page: Joi.string().required(),
      can_view: Joi.boolean().default(false),
      can_add: Joi.boolean().default(false),
      can_edit: Joi.boolean().default(false),
      can_delete: Joi.boolean().default(false),
      permission_password: Joi.string().allow('', null).optional(),
    })
  ).required(),
});

export async function GET(
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
    const result = await pool.query(
      'SELECT * FROM user_permissions WHERE user_id = $1',
      [resolvedParams.id]
    );

    return NextResponse.json({ permissions: result.rows });
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
    const { error, value } = updatePermissionsSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    // Delete existing permissions
    await pool.query('DELETE FROM user_permissions WHERE user_id = $1', [resolvedParams.id]);

    // Insert new permissions
    for (const perm of value.permissions) {
      if (perm.can_view || perm.can_add || perm.can_edit || perm.can_delete) {
        let hashedPassword = null;
        if (perm.can_delete && perm.permission_password && perm.permission_password.trim()) {
          hashedPassword = await bcrypt.hash(perm.permission_password, 10);
        }

        await pool.query(
          `INSERT INTO user_permissions (user_id, page, can_view, can_add, can_edit, can_delete, permission_password)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            resolvedParams.id,
            perm.page,
            perm.can_view || false,
            perm.can_add || false,
            perm.can_edit || false,
            perm.can_delete || false,
            hashedPassword,
          ]
        );
      }
    }

    const result = await pool.query(
      'SELECT * FROM user_permissions WHERE user_id = $1',
      [resolvedParams.id]
    );

    return NextResponse.json({ permissions: result.rows });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

