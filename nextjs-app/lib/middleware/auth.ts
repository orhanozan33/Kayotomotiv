import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getPool } from '@/lib/config/database';
import envConfig from '@/lib/config/env';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    is_active: boolean;
  };
}

export async function authenticate(
  request: NextRequest
): Promise<{ user: AuthenticatedRequest['user']; error?: NextResponse }> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return {
        user: undefined,
        error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
      };
    }

    if (!envConfig.jwt.secret) {
      console.error('JWT_SECRET environment variable eksik!');
      return {
        user: undefined,
        error: NextResponse.json({ error: 'Server configuration error' }, { status: 500 }),
      };
    }

    const decoded = jwt.verify(token, envConfig.jwt.secret) as { userId: string };

    // Verify user still exists and is active
    const result = await getPool().query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return {
        user: undefined,
        error: NextResponse.json({ error: 'Invalid or inactive user' }, { status: 401 }),
      };
    }

    return { user: result.rows[0] };
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return {
        user: undefined,
        error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }),
      };
    }
    if (error.name === 'TokenExpiredError') {
      return {
        user: undefined,
        error: NextResponse.json({ error: 'Token expired' }, { status: 401 }),
      };
    }
    return {
      user: undefined,
      error: NextResponse.json({ error: 'Authentication failed' }, { status: 401 }),
    };
  }
}

export function requireAdmin(user: AuthenticatedRequest['user']): NextResponse | null {
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  return null;
}

