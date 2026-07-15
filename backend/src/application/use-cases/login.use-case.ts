import { type LoginDto, loginSchema } from '@dc-hono-demo/shared/schemas/auth';
import { GraphQLError } from 'graphql';
import type { DbUser, UserRepository } from '@/domain/repositories/user.repository';
import { verifyPassword } from '@/utils/crypto';

export const loginUseCase = (userRepository: UserRepository) => {
  return async (input: LoginDto): Promise<DbUser> => {
    const result = loginSchema.safeParse(input);

    if (!result.success) {
      throw new GraphQLError('メールアドレスまたはパスワードが正しくありません');
    }

    const { email, password } = result.data;
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new GraphQLError('メールアドレスまたはパスワードが正しくありません');
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      throw new GraphQLError('メールアドレスまたはパスワードが正しくありません');
    }

    return user;
  };
};
