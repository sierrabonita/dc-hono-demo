// For Hono RPC type inference
import { zValidator } from '@hono/zod-validator';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { createUserUseCase } from '@/application/use-cases/create-user.use-case';
import { getMeUseCase } from '@/application/use-cases/get-me.use-case';
import { loginUseCase } from '@/application/use-cases/login.use-case';
import { sendVerificationEmailUseCase } from '@/application/use-cases/send-verification-email.use-case';
import {
  deleteUserUseCase,
  updateMeUseCase,
  updateUserRoleUseCase,
} from '@/application/use-cases/update-user.use-case';
import { DrizzleReviewRepository } from '@/infrastructure/repositories/drizzle-review.repository';
import { DrizzleUserRepository } from '@/infrastructure/repositories/drizzle-user.repository';
import type { Bindings } from '@/types';

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '/*',
  cors({
    origin: ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  }),
);

const routes = app
  .get('/reviews', async (c) => {
    const db = drizzle(c.env.DB);
    const reviewRepo = new DrizzleReviewRepository(db);
    const reviews = await reviewRepo.findAllWithRelations();
    return c.json(reviews);
  })
  .get('/users', async (c) => {
    const db = drizzle(c.env.DB);
    const userRepo = new DrizzleUserRepository(db);
    const users = await userRepo.findAll();
    return c.json(users);
  })
  .get('/users/:id', async (c) => {
    const id = parseInt(c.req.param('id'), 10);
    const db = drizzle(c.env.DB);
    const userRepo = new DrizzleUserRepository(db);
    const user = await userRepo.findById(id);
    if (!user) return c.json({ error: 'Not found' }, 404);
    return c.json(user);
  })
  .post('/users/me', zValidator('json', z.object({ userId: z.number() })), async (c) => {
    const { userId } = c.req.valid('json');
    const db = drizzle(c.env.DB);
    const userRepo = new DrizzleUserRepository(db);
    const reviewRepo = new DrizzleReviewRepository(db);
    const getMeUc = getMeUseCase(userRepo, reviewRepo);
    const me = await getMeUc(userId);
    if (!me) return c.json({ error: 'Not found' }, 404);
    return c.json(me);
  })
  .post(
    '/auth/register',
    zValidator(
      'json',
      z.object({
        token: z.string(),
        name: z.string(),
        password: z.string(),
        email: z.string(),
      }),
    ),
    async (c) => {
      const input = c.req.valid('json');
      const db = drizzle(c.env.DB);
      const userRepo = new DrizzleUserRepository(db);
      const createUserUc = createUserUseCase(userRepo);

      const existingUser = await userRepo.findByEmail(input.email);
      if (existingUser) {
        return c.json({ error: 'Email already registered' }, 400);
      }

      const user = await createUserUc(input, input.email, 0);
      return c.json(user);
    },
  )
  .put(
    '/users/me',
    zValidator(
      'json',
      z.object({
        userId: z.number(),
        input: z.object({
          name: z.string().optional(),
          email: z.string().optional(),
          password: z.string().optional(),
        }),
      }),
    ),
    async (c) => {
      const { userId, input } = c.req.valid('json');
      const db = drizzle(c.env.DB);
      const userRepo = new DrizzleUserRepository(db);
      const updateMeUc = updateMeUseCase(userRepo);
      const user = await updateMeUc(userId, input as Parameters<typeof updateMeUc>[1]);
      return c.json(user);
    },
  )
  .put(
    '/users/role',
    zValidator('json', z.object({ id: z.number(), role: z.number() })),
    async (c) => {
      const input = c.req.valid('json');
      const db = drizzle(c.env.DB);
      const userRepo = new DrizzleUserRepository(db);
      const updateUserRoleUc = updateUserRoleUseCase(userRepo);
      const user = await updateUserRoleUc(input as Parameters<typeof updateUserRoleUc>[0]);
      return c.json(user);
    },
  )
  .delete('/users/:id', async (c) => {
    const id = parseInt(c.req.param('id'), 10);
    const db = drizzle(c.env.DB);
    const userRepo = new DrizzleUserRepository(db);
    const deleteUserUc = deleteUserUseCase(userRepo);
    const user = await deleteUserUc(id);
    return c.json(user);
  })
  .post(
    '/auth/login',
    zValidator('json', z.object({ email: z.string(), password: z.string() })),
    async (c) => {
      const input = c.req.valid('json');
      const db = drizzle(c.env.DB);
      const userRepo = new DrizzleUserRepository(db);
      const loginUc = loginUseCase(userRepo);
      try {
        const user = await loginUc(input);
        return c.json(user);
      } catch (e: unknown) {
        return c.json({ error: e instanceof Error ? e.message : 'Unknown error' }, 401);
      }
    },
  )
  .post(
    '/auth/send-verification',
    zValidator('json', z.object({ email: z.string() })),
    async (c) => {
      const input = c.req.valid('json');
      const db = drizzle(c.env.DB);
      const userRepo = new DrizzleUserRepository(db);
      const sendVerificationEmailUc = sendVerificationEmailUseCase(userRepo, c.env);
      const success = await sendVerificationEmailUc(input);
      return c.json({ success });
    },
  );

export type AppType = typeof routes;
export default app;
