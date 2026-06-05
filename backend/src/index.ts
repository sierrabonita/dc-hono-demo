import { graphqlServer } from '@hono/graphql-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getResolvers } from '@/graphql/resolvers';
import { typeDefs } from '@/graphql/typeDefs';
import type { Bindings } from '@/types';

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
    schema: typeDefs,
    graphiql: true, // ブラウザ上でクエリをテストできるUIを有効化
    rootResolver: (c) => getResolvers(c),
  }),
);
export default app;
