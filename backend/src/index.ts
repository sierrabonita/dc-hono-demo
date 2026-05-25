import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { users } from './db/schema';

// Cloudflareの環境変数の型定義
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '/*',
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173'
    ],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    maxAge: 600, // ブラウザキャッシュ（秒）
  })
);

// GET
app.get('/users', async (c) => {
  // c.env.DB（Wranglerが注入してくれるD1）をdrizzleに渡す
  const db = drizzle(c.env.DB);
  
  // ユーザー一覧を取得
  const allUsers = await db.select().from(users).all();
  
  return c.json(allUsers);
});

app.get('/users/:id', async (c) =>{
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'))

  const user = await db.select().from(users).where(eq(users.id, id)).get();

  if(!user) {
    return c.json({error: 'ユーザーが見つかりません'}, 404)
  }

  return c.json(user);
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

// PUT
app.put('/users/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'))
  const body = await c.req.json<{ name: string; email: string }>();

  const updateUser = await db.update(users).set({
    ...(body.name && {name: body.name}),
    ...(body.email && {email: body.email}),
  })
  .where(eq(users.id, id))
  .returning()
  .get()

  if(!updateUser) {
    return c.json({error: 'ユーザーが見つかりません'}, 404)
  }

  return c.json({success: true, user: updateUser})

})

//DELETE
app.delete('/users/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'))

  const deletedUser = await db.delete(users).where(eq(users.id, id)).returning().get()

  if(!deletedUser) {
    return c.json({error: 'ユーザーが見つかりません'}, 404)
  }

  return c.json({success: true, message: "ユーザーは削除されました", user: deletedUser})

})

export default app;