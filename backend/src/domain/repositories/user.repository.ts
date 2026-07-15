import type { usersTable } from '@/db/schema/users';

export type DbUser = typeof usersTable.$inferSelect;

export interface UserRepository {
  findById(id: number): Promise<DbUser | null>;
  findByEmail(email: string): Promise<DbUser | null>;
  findAll(): Promise<DbUser[]>;
  create(data: Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbUser>;
  update(
    id: number,
    data: Partial<Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<DbUser>;
  delete(id: number): Promise<DbUser>;
}
