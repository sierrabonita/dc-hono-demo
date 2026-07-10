import { type LoginDto, loginSchema } from '@dc-hono-demo/shared/schemas/auth';
import {
  type CreateUserDto,
  createUserSchema,
  type DeleteUserDto,
  type UpdateUserDto,
  updateUserSchema,
} from '@dc-hono-demo/shared/schemas/user';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { GraphQLError } from 'graphql';
import type { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import { moviesTable } from '@/db/schema/movies';
import { reviewsTable } from '@/db/schema/reviews';
import { usersTable } from '@/db/schema/users';
import type { Bindings } from '@/types';
import { hashPassword, verifyPassword } from '@/utils/crypto';

export const getResolvers = (c: Context<{ Bindings: Bindings }>) => {
  // Honoのコンテキスト(c)からDBインスタンスを取得
  const db = drizzle(c.env.DB);

  return {
    reviews: async () => {
      const rows = await db
        .select({
          review: reviewsTable,
          user: usersTable,
          movie: moviesTable,
        })
        .from(reviewsTable)
        .innerJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
        .innerJoin(moviesTable, eq(reviewsTable.movieId, moviesTable.id))
        .all();

      return rows.map((row) => ({
        ...row.review,
        user: row.user,
        movie: row.movie,
      }));
    },
    users: async () => {
      return await db.select().from(usersTable).all();
    },
    user: async ({ id }: { id: number }) => {
      const user = await db.select().from(usersTable).where(eq(usersTable.id, id)).get();

      if (!user) {
        throw new GraphQLError('ユーザーが見つかりません', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return user;
    },
    me: async () => {
      const token = getCookie(c, 'auth_token');
      if (!token) return null;

      try {
        const payload = await verify(token, c.env.JWT_SECRET, 'HS256');
        if (!payload.id) return null;

        const user = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, payload.id as number))
          .get();

        if (!user) return null;

        return {
          ...user,
          reviews: async () => {
            const rows = await db
              .select({
                review: reviewsTable,
                movie: moviesTable,
              })
              .from(reviewsTable)
              .innerJoin(moviesTable, eq(reviewsTable.movieId, moviesTable.id))
              .where(eq(reviewsTable.userId, user.id))
              .all();
            return rows.map((row) => {
              return { ...row.review, user, movie: row.movie };
            });
          },
        };
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    createUser: async ({ input }: { input: CreateUserDto }) => {
      const result = createUserSchema.safeParse(input);

      if (!result.success) {
        const errorMessage = result.error.issues.map((e) => e.message).join(', ');
        throw new GraphQLError(`バリデーションエラー: ${errorMessage}`);
      }

      const validData = result.data;
      const hashedPassword = await hashPassword(validData.password);
      const newSlug = crypto.randomUUID();

      const newUser = await db
        .insert(usersTable)
        .values({
          name: validData.name,
          slug: newSlug,
          email: validData.email,
          password: hashedPassword,
          role: validData.role,
        })
        .returning()
        .get();
      return newUser;
    },
    updateUser: async ({ input }: { input: UpdateUserDto }) => {
      const result = updateUserSchema.safeParse(input);

      if (!result.success) {
        const errorMessage = result.error.issues.map((e) => e.message).join(', ');
        throw new GraphQLError(`バリデーションエラー: ${errorMessage}`);
      }

      const validData = result.data;

      const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, validData.id))
        .get();
      if (!existingUser) throw new GraphQLError('更新対象のユーザーが見つかりません');

      let finalPassword = existingUser.password;
      if (validData.password) {
        finalPassword = await hashPassword(validData.password);
      }
      const updatedUser = await db
        .update(usersTable)
        .set({
          ...(validData.name && { name: validData.name }),
          ...(validData.email && { email: validData.email }),
          password: finalPassword,
          ...(validData.role && { role: validData.role }),
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(usersTable.id, validData.id))
        .returning()
        .get();

      return updatedUser;
    },
    deleteUser: async ({ id }: DeleteUserDto) => {
      const existingUser = await db.select().from(usersTable).where(eq(usersTable.id, id)).get();
      if (!existingUser) throw new GraphQLError('削除対象のユーザーが見つかりません');

      const deletedUser = await db
        .delete(usersTable)
        .where(eq(usersTable.id, id))
        .returning()
        .get();

      return deletedUser;
    },
    login: async ({ input }: { input: LoginDto }) => {
      const result = loginSchema.safeParse(input);

      if (!result.success) {
        throw new GraphQLError('メールアドレスまたはパスワードが正しくありません');
      }

      const { email, password } = result.data;
      const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).get();

      if (!user) {
        throw new GraphQLError('メールアドレスまたはパスワードが正しくありません');
      }

      const isValidPassword = await verifyPassword(password, user.password);

      if (!isValidPassword) {
        throw new GraphQLError('メールアドレスまたはパスワードが正しくありません');
      }

      const payload = {
        id: user.id,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 有効期限（現在の時刻 + 24時間）
      };

      const token = await sign(payload, c.env.JWT_SECRET, 'HS256');

      setCookie(c, 'auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // 本番環境ではtrue
        sameSite: 'Lax', // 開発環境でポートが異なる場合はLaxに設定
        path: '/',
        maxAge: 60 * 60 * 24,
      });

      return {
        user,
      };
    },
    logout: async () => {
      deleteCookie(c, 'auth_token', {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
      });

      return true;
    },
  };
};
