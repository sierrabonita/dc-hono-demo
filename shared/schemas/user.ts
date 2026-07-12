import { z } from 'zod';
import { USER_ROLES } from '../constants/roles';

// ベースとなるUser（GraphQLのレスポンスなどで使用）
export const userSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('無効なメールアドレス形式です'),
  role: z.union([z.literal(USER_ROLES.NORMAL), z.literal(USER_ROLES.ADMIN)]),
  createdAt: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const createUserSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('無効なメールアドレス形式です'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
  role: z.union([z.literal(USER_ROLES.NORMAL), z.literal(USER_ROLES.ADMIN)]),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateMeSchema = z.object({
  name: z.string().min(1, '名前を入力してください').optional(),
  email: z.string().email('無効なメールアドレス形式です').optional(),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください').optional(),
});

export type UpdateMeDto = z.infer<typeof updateMeSchema>;

export const updateUserRoleSchema = z.object({
  id: z.number(),
  role: z.union([z.literal(USER_ROLES.NORMAL), z.literal(USER_ROLES.ADMIN)]),
});

export type UpdateUserRoleDto = z.infer<typeof updateUserRoleSchema>;

export const deleteUserSchema = z.object({
  id: z.number(),
});

export type DeleteUserDto = z.infer<typeof deleteUserSchema>;
