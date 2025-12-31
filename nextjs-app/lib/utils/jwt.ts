import jwt from 'jsonwebtoken';
import envConfig from '@/lib/config/env';

export function generateToken(userId: string): string {
  const secret = envConfig.jwt.secret;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ userId }, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): { userId: string } {
  const secret = envConfig.jwt.secret;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return jwt.verify(token, secret) as { userId: string };
}

