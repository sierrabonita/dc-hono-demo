import type { LoginDto } from '@dc-hono-demo/shared/schemas/auth';
import type {
  CreateUserDto,
  DeleteUserDto,
  UpdateMeDto,
  UpdateUserRoleDto,
} from '@dc-hono-demo/shared/schemas/user';
import { drizzle } from 'drizzle-orm/d1';
import { GraphQLError } from 'graphql';
import type { Context } from 'hono';
// Use Cases
import { createUserUseCase } from '@/application/use-cases/create-user.use-case';
import { getMeUseCase } from '@/application/use-cases/get-me.use-case';
import { loginUseCase } from '@/application/use-cases/login.use-case';
import {
  deleteUserUseCase,
  updateMeUseCase,
  updateUserRoleUseCase,
} from '@/application/use-cases/update-user.use-case';
// Session Helpers
import { clearAuthSession, getAuthSession, setAuthSession } from '@/graphql/session';
// Repositories
import { DrizzleReviewRepository } from '@/infrastructure/repositories/drizzle-review.repository';
import { DrizzleUserRepository } from '@/infrastructure/repositories/drizzle-user.repository';
import type { Bindings } from '@/types';

export const getResolvers = (c: Context<{ Bindings: Bindings }>) => {
  const db = drizzle(c.env.DB);
  const userRepo = new DrizzleUserRepository(db);
  const reviewRepo = new DrizzleReviewRepository(db);

  // ユースケースの初期化 (Ucサフィックスを付けてシャドーイングを防止)
  const createUserUc = createUserUseCase(userRepo);
  const getMeUc = getMeUseCase(userRepo, reviewRepo);
  const loginUc = loginUseCase(userRepo);
  const updateMeUc = updateMeUseCase(userRepo);
  const updateUserRoleUc = updateUserRoleUseCase(userRepo);
  const deleteUserUc = deleteUserUseCase(userRepo);

  return {
    reviews: async () => {
      return await reviewRepo.findAllWithRelations();
    },
    users: async () => {
      return await userRepo.findAll();
    },
    user: async ({ id }: { id: number }) => {
      const user = await userRepo.findById(id);

      if (!user) {
        throw new GraphQLError('ユーザーが見つかりません', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return user;
    },
    me: async () => {
      const userId = await getAuthSession(c);
      if (!userId) return null;
      return await getMeUc(userId);
    },
    createUser: async ({ input }: { input: CreateUserDto }) => {
      return await createUserUc(input);
    },
    updateMe: async ({ input }: { input: UpdateMeDto }) => {
      const userId = await getAuthSession(c);
      if (!userId) {
        throw new GraphQLError('ログインしていません', {
          extensions: { code: 'UNAUTHORIZED' },
        });
      }

      return await updateMeUc(userId, input);
    },
    updateUserRole: async ({ input }: { input: UpdateUserRoleDto }) => {
      return await updateUserRoleUc(input);
    },
    deleteUser: async ({ id }: DeleteUserDto) => {
      return await deleteUserUc(id);
    },
    login: async ({ input }: { input: LoginDto }) => {
      const user = await loginUc(input);
      await setAuthSession(c, user);
      return {
        user,
      };
    },
    logout: async () => {
      clearAuthSession(c);
      return true;
    },
  };
};
