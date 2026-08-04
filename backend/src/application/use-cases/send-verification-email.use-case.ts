import { sendVerificationEmailSchema, type SendVerificationEmailDto } from '@dc-hono-demo/shared/schemas/user';
import { GraphQLError } from 'graphql';
import { sign } from 'hono/jwt';
import type { UserRepository } from '@/domain/repositories/user.repository';
import type { Bindings } from '@/types';

export const sendVerificationEmailUseCase = (userRepository: UserRepository, env: Bindings) => {
  return async (input: SendVerificationEmailDto): Promise<boolean> => {
    const result = sendVerificationEmailSchema.safeParse(input);
    if (!result.success) {
      const errorMessage = result.error.issues.map((e) => e.message).join(', ');
      throw new GraphQLError(`バリデーションエラー: ${errorMessage}`);
    }

    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new GraphQLError('このメールアドレスは既に登録されています');
    }

    const payload = {
      email: input.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1時間有効
    };

    const token = await sign(payload, env.JWT_SECRET, 'HS256');

    const verificationUrl = `${env.FRONTEND_URL}/register/complete?token=${token}`;

    try {
      const response = await fetch(env.MAILPIT_SEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          From: {
            Email: 'no-reply@example.com',
            Name: 'Cinema Review',
          },
          To: [
            {
              Email: input.email,
              Name: 'ゲスト', // 名前はまだ未設定
            },
          ],
          Subject: '【Cinema Review】新規登録の確認',
          Text: `Cinema Reviewへのご登録ありがとうございます。\n以下のリンクをクリックして、新規登録を完了してください。\n\n${verificationUrl}\n\nこのリンクの有効期限は1時間です。`,
          HTML: `<p>Cinema Reviewへのご登録ありがとうございます。</p><p>以下のリンクをクリックして、新規登録を完了してください。</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>※このリンクの有効期限は1時間です。</p>`,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Mailpit sending error status:', response.status, errText);
        throw new Error(`Mailpit error: ${errText}`);
      }
    } catch (e) {
      console.error('Failed to send verification email via Mailpit:', e);
      throw new GraphQLError('認証メールの送信に失敗しました');
    }

    return true;
  };
};
