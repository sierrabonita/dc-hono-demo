import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, { message: '名前は必須です' }),
  email: z.email({ message: '無効なメールアドレス形式です' }),
  password: z.string().min(6, { message: 'パスワードは6文字以上で入力してください' }),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, { message: '名前は1文字以上で入力してください' }).optional(),
  email: z.email({ message: '無効なメールアドレス形式です' }).optional(),
  password: z.string().min(6, { message: 'パスワードは6文字以上で入力してください' }).optional(),
});

export const loginSchema = z.object({
  email: z.email({ message: '無効なメールアドレス形式です' }),
  password: z.string().min(1, { message: 'パスワードを入力してください' }),
});
