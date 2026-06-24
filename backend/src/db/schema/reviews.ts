import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { moviesTable } from '@/db/schema/movies';
import { usersTable } from '@/db/schema/users';

export const reviewsTable = sqliteTable(
  'reviews',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .references(() => usersTable.id)
      .notNull(),
    movieId: integer('movie_id')
      .references(() => moviesTable.id)
      .notNull(),
    content: text().notNull(),
    isSpoiler: integer('is_spoiler', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    userMovieUnique: unique('user_movie_unique').on(table.userId, table.movieId),
  }),
);
