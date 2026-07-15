import type { moviesTable } from '@/db/schema/movies';
import type { reviewsTable } from '@/db/schema/reviews';
import type { usersTable } from '@/db/schema/users';

export type Review = typeof reviewsTable.$inferSelect;
export type DbUser = typeof usersTable.$inferSelect;
export type Movie = typeof moviesTable.$inferSelect;

export type ReviewWithRelations = Review & {
  user: DbUser;
  movie: Movie;
};

export interface ReviewRepository {
  findAllWithRelations(): Promise<ReviewWithRelations[]>;
  findByUserIdWithRelations(userId: number): Promise<ReviewWithRelations[]>;
}
