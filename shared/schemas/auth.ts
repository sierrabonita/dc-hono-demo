import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ message: '無効なメールアドレス形式です' }),
  password: z.string().min(1, { message: 'パスワードを入力してください' }),
});

export type LoginDto = z.infer<typeof loginSchema>;
