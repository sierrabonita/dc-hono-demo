import { graphqlServer } from '@hono/graphql-server';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { buildSchema, GraphQLError } from 'graphql';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { users } from './db/schema';

const schema = buildSchema(`
  type User {
    id: Int!
    name: String!
    email: String!
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    updateUser(id: Int!, name: String, email: String): User
    deleteUser(id: Int!): User
  }
`);

// Cloudflareの環境変数の型定義
type Bindings = {
  DB: D1Database;
};

const createUserSchema = z.object({
  name: z.string().min(1, { message: '名前は必須です' }),
  email: z.string().email({ message: '無効なメールアドレス形式です' }),
});

const updateUserSchema = z.object({
  name: z.string().min(1, { message: '名前は1文字以上で入力してください' }).optional(),
  email: z.string().email({ message: '無効なメールアドレス形式です' }).optional(),
});

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '/*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    maxAge: 600, // ブラウザキャッシュ（秒）
  }),
);

app.use(
  '/graphql',
  graphqlServer({
    schema,
    graphiql: true, // ブラウザ上でクエリをテストできるUIを有効化
    rootResolver: (c) => {
      // Honoのコンテキスト(c)からDBインスタンスを取得
      const db = drizzle(c.env.DB);

      return {
        users: async () => {
          return await db.select().from(users).all();
        },
        user: async ({ id }: { id: number }) => {
          const user = await db.select().from(users).where(eq(users.id, id)).get();

          if (!user) {
            throw new GraphQLError('ユーザーが見つかりません', {
              extensions: { code: 'NOT_FOUND' },
            });
          }

          return user;
        },
        createUser: async (args: { name: string; email: string }) => {
          const result = createUserSchema.safeParse(args);

          if (!result.success) {
            const errorMessage = result.error.issues.map((e) => e.message).join(', ');
            throw new GraphQLError(`バリデーションエラー: ${errorMessage}`);
          }

          const validData = result.data;
          const newUser = await db
            .insert(users)
            .values({ name: validData.name, email: validData.email })
            .returning()
            .get();
          return newUser;
        },
        updateUser: async (args: { id: number; name?: string; email?: string }) => {
          const result = updateUserSchema.safeParse(args);

          if (!result.success) {
            const errorMessage = result.error.issues.map((e) => e.message).join(', ');
            throw new GraphQLError(`バリデーションエラー: ${errorMessage}`);
          }

          const validData = result.data;

          const existingUser = await db.select().from(users).where(eq(users.id, args.id)).get();
          if (!existingUser) throw new GraphQLError('更新対象のユーザーが見つかりません');

          const updatedUser = await db
            .update(users)
            .set({
              ...(validData.name && { name: validData.name }),
              ...(validData.email && { email: validData.email }),
            })
            .where(eq(users.id, args.id))
            .returning()
            .get();

          return updatedUser;
        },
        deleteUser: async ({ id }: { id: number }) => {
          const existingUser = await db.select().from(users).where(eq(users.id, id)).get();
          if (!existingUser) throw new GraphQLError('削除対象のユーザーが見つかりません');

          const deletedUser = await db.delete(users).where(eq(users.id, id)).returning().get();

          return deletedUser;
        },
      };
    },
  }),
);
export default app;
