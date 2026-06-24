import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const moviesTable = sqliteTable('movies', {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  originalTitle: text('original_title'),
  releaseDate: text('release_date'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});
