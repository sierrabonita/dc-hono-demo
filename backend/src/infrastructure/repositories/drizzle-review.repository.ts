import { eq } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/d1';
import { moviesTable } from '@/db/schema/movies';
import { reviewsTable } from '@/db/schema/reviews';
import { usersTable } from '@/db/schema/users';
import type {
  ReviewRepository,
  ReviewWithRelations,
} from '@/domain/repositories/review.repository';

type DbType = ReturnType<typeof drizzle>;

export class DrizzleReviewRepository implements ReviewRepository {
  constructor(private db: DbType) {}

  async findAllWithRelations(): Promise<ReviewWithRelations[]> {
    const rows = await this.db
      .select({
        review: reviewsTable,
        user: usersTable,
        movie: moviesTable,
      })
      .from(reviewsTable)
      .innerJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
      .innerJoin(moviesTable, eq(reviewsTable.movieId, moviesTable.id))
      .all();

    return rows.map((row) => ({
      ...row.review,
      user: row.user,
      movie: row.movie,
    }));
  }

  async findByUserIdWithRelations(userId: number): Promise<ReviewWithRelations[]> {
    const rows = await this.db
      .select({
        review: reviewsTable,
        user: usersTable,
        movie: moviesTable,
      })
      .from(reviewsTable)
      .innerJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
      .innerJoin(moviesTable, eq(reviewsTable.movieId, moviesTable.id))
      .where(eq(reviewsTable.userId, userId))
      .all();

    return rows.map((row) => ({
      ...row.review,
      user: row.user,
      movie: row.movie,
    }));
  }
}
