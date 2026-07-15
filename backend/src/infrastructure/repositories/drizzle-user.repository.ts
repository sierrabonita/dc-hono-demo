import { eq, sql } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/d1';
import { usersTable } from '@/db/schema/users';
import type { DbUser, UserRepository } from '@/domain/repositories/user.repository';

type DbType = ReturnType<typeof drizzle>;

export class DrizzleUserRepository implements UserRepository {
  constructor(private db: DbType) {}

  async findById(id: number): Promise<DbUser | null> {
    const user = await this.db.select().from(usersTable).where(eq(usersTable.id, id)).get();
    return user || null;
  }

  async findByEmail(email: string): Promise<DbUser | null> {
    const user = await this.db.select().from(usersTable).where(eq(usersTable.email, email)).get();
    return user || null;
  }

  async findAll(): Promise<DbUser[]> {
    return await this.db.select().from(usersTable).all();
  }

  async create(data: Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbUser> {
    const newUser = await this.db.insert(usersTable).values(data).returning().get();
    if (!newUser) {
      throw new Error('Failed to create user');
    }
    return newUser;
  }

  async update(
    id: number,
    data: Partial<Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<DbUser> {
    const updatedUser = await this.db
      .update(usersTable)
      .set({
        ...data,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(usersTable.id, id))
      .returning()
      .get();
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }
    return updatedUser;
  }

  async delete(id: number): Promise<DbUser> {
    const deletedUser = await this.db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning()
      .get();
    if (!deletedUser) {
      throw new Error('Failed to delete user');
    }
    return deletedUser;
  }
}
