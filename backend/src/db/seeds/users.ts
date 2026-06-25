import { hashPassword } from '@/utils/crypto';
import { usersTable } from '../schema/users';

// biome-ignore lint/suspicious/noExplicitAny: cleanupでは型を決めきれてない
export const clean = async (db: any) => {
  await db.delete(usersTable);
};

// biome-ignore lint/suspicious/noExplicitAny: seedingでは型を決めきれてない
export const seed = async (db: any, env: any) => {
  const plainPassword = env.SEED_USER_PASSWORD || 'temporary_password';
  const hashedPassword = await hashPassword(plainPassword);

  await db.insert(usersTable).values([
    {
      slug: 'admin001',
      name: '管理者',
      email: 'admin_1@example.com',
      password: hashedPassword,
      role: 1,
    },
    {
      slug: 'normal001',
      name: '山田 太郎',
      email: 'normal_1@example.com',
      password: hashedPassword,
      role: 0,
    },
    {
      slug: 'normal002',
      name: '田中 花子',
      email: 'normal_2@example.com',
      password: hashedPassword,
      role: 0,
    },
  ]);

  return await db.select().from(usersTable);
};
