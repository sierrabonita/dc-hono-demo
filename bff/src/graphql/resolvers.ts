import type { LoginDto, SendVerificationEmailDto } from '@dc-hono-demo/shared/schemas/auth';
import type {
  CreateUserDto,
  DeleteUserDto,
  UpdateMeDto,
  UpdateUserRoleDto,
} from '@dc-hono-demo/shared/schemas/user';
import { GraphQLError } from 'graphql';
import type { Context } from 'hono';
import { verify } from 'hono/jwt';

import { clearAuthSession, getAuthSession, setAuthSession } from '@/graphql/session';
import type { Bindings } from '@/types';

// Helper for calling the internal backend API
const fetchApi = async <T = unknown>(
  c: Context<{ Bindings: Bindings }>,
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const url = `${c.env.BACKEND_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errorMsg = 'API Error';
    try {
      const errData = (await res.json()) as { error?: string };
      if (errData.error) errorMsg = errData.error;
    } catch {}

    // Convert status to appropriate GraphQL errors
    if (res.status === 401) {
      throw new GraphQLError(errorMsg, { extensions: { code: 'UNAUTHORIZED' } });
    }
    if (res.status === 404) {
      throw new GraphQLError(errorMsg, { extensions: { code: 'NOT_FOUND' } });
    }
    throw new GraphQLError(errorMsg);
  }

  return res.json() as Promise<T>;
};

export const getResolvers = (c: Context<{ Bindings: Bindings }>) => {
  return {
    reviews: async () => {
      return await fetchApi(c, '/reviews');
    },
    users: async () => {
      return await fetchApi(c, '/users');
    },
    user: async ({ id }: { id: number }) => {
      return await fetchApi(c, `/users/${id}`);
    },
    me: async () => {
      const userId = await getAuthSession(c);
      if (!userId) return null;
      try {
        return await fetchApi(c, '/users/me', {
          method: 'POST',
          body: JSON.stringify({ userId }),
        });
      } catch (_e) {
        return null;
      }
    },
    createUser: async ({ input }: { input: CreateUserDto }) => {
      // Decode JWT locally in BFF
      let payload: Record<string, unknown>;
      try {
        payload = await verify(input.token, c.env.JWT_SECRET, 'HS256');
      } catch (_e) {
        throw new GraphQLError('無効なトークンか、有効期限が切れています');
      }

      if (!payload?.email) {
        throw new GraphQLError('トークンにメールアドレスが含まれていません');
      }

      const email = payload.email as string;

      // Call backend to create
      const user = await fetchApi(c, '/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...input, email }),
      });

      await setAuthSession(c, user);
      return user;
    },
    updateMe: async ({ input }: { input: UpdateMeDto }) => {
      const userId = await getAuthSession(c);
      if (!userId) {
        throw new GraphQLError('ログインしていません', {
          extensions: { code: 'UNAUTHORIZED' },
        });
      }

      return await fetchApi(c, '/users/me', {
        method: 'PUT',
        body: JSON.stringify({ userId, input }),
      });
    },
    updateUserRole: async ({ input }: { input: UpdateUserRoleDto }) => {
      return await fetchApi(c, '/users/role', {
        method: 'PUT',
        body: JSON.stringify(input),
      });
    },
    deleteUser: async ({ id }: DeleteUserDto) => {
      return await fetchApi(c, `/users/${id}`, {
        method: 'DELETE',
      });
    },
    login: async ({ input }: { input: LoginDto }) => {
      const user = await fetchApi(c, '/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      await setAuthSession(c, user);
      return { user };
    },
    logout: async () => {
      clearAuthSession(c);
      return true;
    },
    sendVerificationEmail: async ({ input }: { input: SendVerificationEmailDto }) => {
      const res = await fetchApi(c, '/auth/send-verification', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return res.success;
    },
  };
};
