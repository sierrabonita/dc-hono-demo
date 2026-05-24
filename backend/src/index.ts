import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { users } from './db/schema';

// Cloudflareの環境変数の型定義
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// GET
app.get('/users', async (c) => {
  // c.env.DB（Wranglerが注入してくれるD1）をdrizzleに渡す
  const db = drizzle(c.env.DB);
  
  // ユーザー一覧を取得
  const allUsers = await db.select().from(users).all();
  
  return c.json(allUsers);
});

// POST
app.post('/users', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json<{ name: string; email: string }>();
  
  const result = await db.insert(users).values({
    name: body.name,
    email: body.email,
  }).returning();

  return c.json({ success: true, user: result[0] }, 201);
});

export default app;