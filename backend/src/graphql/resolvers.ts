import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { GraphQLError } from 'graphql';
import type { Context } from 'hono';
import { sign } from 'hono/jwt';
import { usersTable } from '@/db/schema/users';
import { createUserSchema, loginSchema, updateUserSchema } from '@/libs/zod';
import type { Bindings } from '@/types';
import { hashPassword, verifyPassword } from '@/utils/crypto';

export const getResolvers = (c: Context<{ Bindings: Bindings }>) => {
  // Honoのコンテキスト(c)からDBインスタンスを取得
  const db = drizzle(c.env.DB);

  return {
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
    createUser: async (args: { name: string; email: string; password: string }) => {
      const result = createUserSchema.safeParse(args);

      if (!result.success) {
        const errorMessage = result.error.issues.map((e) => e.message).join(', ');
        throw new GraphQLError(`バリデーションエラー: ${errorMessage}`);
      }

      const validData = result.data;
      const hashedPassword = await hashPassword(validData.password);

      const newUser = await db
        .insert(usersTable)
        .values({ name: validData.name, email: validData.email, password: hashedPassword })
        .returning()
        .get();
      return newUser;
    },
    updateUser: async (args: { id: number; name?: string; email?: string; password?: string }) => {
      const result = updateUserSchema.safeParse(args);

      if (!result.success) {
        const errorMessage = result.error.issues.map((e) => e.message).join(', ');
        throw new GraphQLError(`バリデーションエラー: ${errorMessage}`);
      }

      const validData = result.data;

      const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, args.id))
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
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(usersTable.id, args.id))
        .returning()
        .get();

      return updatedUser;
    },
    deleteUser: async ({ id }: { id: number }) => {
      const existingUser = await db.select().from(usersTable).where(eq(usersTable.id, id)).get();
      if (!existingUser) throw new GraphQLError('削除対象のユーザーが見つかりません');

      const deletedUser = await db
        .delete(usersTable)
        .where(eq(usersTable.id, id))
        .returning()
        .get();

      return deletedUser;
    },
    login: async (args: { email: string; password: string }) => {
      const result = loginSchema.safeParse(args);

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

      const token = await sign(payload, c.env.JWT_SECRET);

      return {
        token,
        user,
      };
    },
  };
};
