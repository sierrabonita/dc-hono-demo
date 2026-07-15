import type { UserRole } from '@dc-hono-demo/shared';
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: integer().primaryKey({ autoIncrement: true }),
  slug: text().unique().notNull(),
  name: text().notNull(),
  email: text().unique().notNull(),
  password: text().notNull().default('temporary_password'),
  role: integer().$type<UserRole>().notNull().default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});
