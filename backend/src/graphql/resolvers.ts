import type { LoginDto } from '@dc-hono-demo/shared/schemas/auth';
import {
  type CreateUserDto,
  createUserSchema,
  type DeleteUserDto,
  type UpdateMeDto,
  type UpdateUserRoleDto,
} from '@dc-hono-demo/shared/schemas/user';
import { drizzle } from 'drizzle-orm/d1';
import { GraphQLError } from 'graphql';
import type { Context } from 'hono';
import { sign } from 'hono/jwt';
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
import { hashPassword } from '@/utils/crypto';

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
    sendVerificationEmail: async ({ input }: { input: CreateUserDto }) => {
      const result = createUserSchema.safeParse(input);
      if (!result.success) {
        const errorMessage = result.error.issues.map((e) => e.message).join(', ');
        throw new GraphQLError(`バリデーションエラー: ${errorMessage}`);
      }

      const existingUser = await userRepo.findByEmail(input.email);
      if (existingUser) {
        throw new GraphQLError('このメールアドレスは既に登録されています');
      }

      const hashedPassword = await hashPassword(input.password);

      const payload = {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1時間有効
      };

      const token = await sign(payload, c.env.JWT_SECRET, 'HS256');

      const origin = new URL(c.req.url).origin;
      const verificationUrl = `${origin}/verify-email?token=${token}`;

      try {
        const response = await fetch(c.env.MAILPIT_SEND_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            From: {
              Address: 'no-reply@example.com',
              Name: 'Cinema Review',
            },
            To: [
              {
                Address: input.email,
                Name: input.name,
              },
            ],
            Subject: '【Cinema Review】新規登録の確認',
            Text: `${input.name}様\n\nCinema Reviewへのご登録ありがとうございます。\n以下のリンクをクリックして、新規登録を完了してください。\n\n${verificationUrl}\n\nこのリンクの有効期限は1時間です。`,
            HTML: `<p>${input.name}様</p><p>Cinema Reviewへのご登録ありがとうございます。</p><p>以下のリンクをクリックして、新規登録を完了してください。</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>※このリンクの有効期限は1時間です。</p>`,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error('Mailpit sending error status:', response.status, errText);
          throw new Error(`Mailpit error: ${errText}`);
        }
      } catch (e) {
        console.error('Failed to send verification email via Mailpit:', e);
        throw new GraphQLError('認証メールの送信に失敗しました');
      }

      return true;
    },
  };
};
