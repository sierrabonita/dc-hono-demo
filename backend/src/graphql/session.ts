import type { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import type { DbUser } from '@/domain/repositories/user.repository';
import type { Bindings } from '@/types';

export const getAuthSession = async (
  c: Context<{ Bindings: Bindings }>,
): Promise<number | null> => {
  const token = getCookie(c, 'auth_token');
  if (!token) return null;

  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256');
    if (!payload.id) return null;
    return payload.id as number;
  } catch (e) {
    console.error('Session validation error:', e);
    return null;
  }
};

export const setAuthSession = async (
  c: Context<{ Bindings: Bindings }>,
  user: DbUser,
): Promise<void> => {
  const payload = {
    id: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 有効期限（24時間）
  };

  const token = await sign(payload, c.env.JWT_SECRET, 'HS256');

  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
};

export const clearAuthSession = (c: Context<{ Bindings: Bindings }>): void => {
  deleteCookie(c, 'auth_token', {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });
};
