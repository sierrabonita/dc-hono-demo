import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { users } from './db/schema';

// Cloudflareの環境変数の型定義
type Bindings = {
  DB: D1Database;
};

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

const createUserSchema = z.object({
  name: z.string().min(1, { message: '名前は必須です' }),
  email: z.string().email({ message: '無効なメールアドレス形式です' }),
});

const updateUserSchema = z.object({
  name: z.string().min(1, { message: '名前は1文字以上で入力してください' }).optional(),
  email: z.string().email({ message: '無効なメールアドレス形式です' }).optional(),
});

// GET
app.get('/users', async (c) => {
  // c.env.DB（Wranglerが注入してくれるD1）をdrizzleに渡す
  const db = drizzle(c.env.DB);

  // ユーザー一覧を取得
  const allUsers = await db.select().from(users).all();

  return c.json(allUsers);
});

app.get('/users/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'));

  if (Number.isNaN(id)) return c.json({ error: '無効なID形式です' }, 400);

  const user = await db.select().from(users).where(eq(users.id, id)).get();

  if (!user) {
    return c.json({ error: 'ユーザーが見つかりません' }, 404);
  }

  return c.json(user);
});

// POST
app.post('/users', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json<{ name: string; email: string }>();
  const resultSchema = createUserSchema.safeParse(body);

  if (!resultSchema.success) {
    return c.json({ success: false, error: resultSchema.error }, 400);
  }

  const validatedBody = resultSchema.data;

  const result = await db
    .insert(users)
    .values({
      name: validatedBody.name,
      email: validatedBody.email,
    })
    .returning();

  return c.json({ success: true, user: result[0] }, 201);
});

// PUT
app.put('/users/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'));

  if (Number.isNaN(id)) return c.json({ error: '無効なID形式です' }, 400);

  const body = await c.req.json();
  const resultSchema = updateUserSchema.safeParse(body);

  if (!resultSchema.success) {
    return c.json({ success: false, error: resultSchema.error }, 400);
  }

  const validatedBody = resultSchema.data;

  const updatedUser = await db
    .update(users)
    .set({
      ...(validatedBody.name && { name: validatedBody.name }),
      ...(validatedBody.email && { email: validatedBody.email }),
    })
    .where(eq(users.id, id))
    .returning()
    .get();

  if (!updatedUser) {
    return c.json({ error: 'ユーザーが見つかりません' }, 404);
  }

  return c.json({ success: true, user: updatedUser });
});

//DELETE
app.delete('/users/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'));

  if (Number.isNaN(id)) return c.json({ error: '無効なID形式です' }, 400);

  const deletedUser = await db.delete(users).where(eq(users.id, id)).returning().get();

  if (!deletedUser) {
    return c.json({ error: 'ユーザーが見つかりません' }, 404);
  }

  return c.json({
    success: true,
    message: 'ユーザーは削除されました',
    user: deletedUser,
  });
});

export default app;
