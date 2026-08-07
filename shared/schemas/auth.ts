import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ message: '無効なメールアドレス形式です' }),
  password: z.string().min(1, { message: 'パスワードを入力してください' }),
});

export type LoginDto = z.infer<typeof loginSchema>;

export const sendVerificationEmailSchema = z.object({
  email: z.string().email('無効なメールアドレス形式です'),
});

export type SendVerificationEmailDto = z.infer<typeof sendVerificationEmailSchema>;

export const sendVerificationEmailFormSchema = sendVerificationEmailSchema
  .extend({
    emailConfirm: z.string().min(1, '確認用メールアドレスを入力してください'),
  })
  .refine((data) => data.email === data.emailConfirm, {
    message: 'メールアドレスが一致しません',
    path: ['emailConfirm'],
  });

export type SendVerificationEmailFormDto = z.infer<typeof sendVerificationEmailFormSchema>;
