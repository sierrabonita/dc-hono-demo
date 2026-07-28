import type { UserRole } from '@dc-hono-demo/shared';
import { graphqlServer } from '@hono/graphql-server';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { verify } from 'hono/jwt';
import { getResolvers } from '@/graphql/resolvers';
import { setAuthSession } from '@/graphql/session';
import { typeDefs } from '@/graphql/typeDefs';
import { DrizzleUserRepository } from '@/infrastructure/repositories/drizzle-user.repository';
import type { Bindings } from '@/types';

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '/*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    maxAge: 600, // ブラウザキャッシュ（秒）
  }),
);

app.use(
  '/graphql',
  graphqlServer({
    schema: typeDefs,
    graphiql: true, // ブラウザ上でクエリをテストできるUIを有効化
    rootResolver: (c) => getResolvers(c),
  }),
);

app.get('/verify-email', async (c) => {
  const token = c.req.query('token');
  if (!token) {
    return c.text('トークンが見つかりません。', 400);
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256');
    if (!payload || !payload.email || !payload.password || !payload.name) {
      return c.text('無効なトークン形式です。', 400);
    }

    const name = payload.name as string;
    const email = payload.email as string;
    const password = payload.password as string;
    const role = (payload.role === 1 ? 1 : 0) as UserRole;

    const db = drizzle(c.env.DB);
    const userRepo = new DrizzleUserRepository(db);

    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      return c.text('このメールアドレスは既に登録されています。', 400);
    }

    const createdUser = await userRepo.create({
      name,
      email,
      password,
      slug: crypto.randomUUID(),
      role,
    });

    await setAuthSession(c, createdUser);

    return c.redirect(`${c.env.FRONTEND_URL}/home`);
  } catch (e) {
    console.error('Email verification error:', e);
    return c.text('リンクの有効期限が切れているか、トークンが無効です。', 400);
  }
});

export default app;
