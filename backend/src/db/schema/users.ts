import type { UserRole } from '@dc-hono-demo/shared';
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  password: text('password').notNull().default('temporary_password'),
  role: integer('role').$type<UserRole>().notNull().default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type DbUser = typeof usersTable.$inferSelect;
export type DbNewUser = typeof usersTable.$inferInsert;
