import { type CreateUserDto, createUserSchema } from '@dc-hono-demo/shared/schemas/user';
import { GraphQLError } from 'graphql';
import type { DbUser, UserRepository } from '@/domain/repositories/user.repository';
import { hashPassword } from '@/utils/crypto';

export const createUserUseCase = (userRepository: UserRepository) => {
  return async (input: CreateUserDto): Promise<DbUser> => {
    const result = createUserSchema.safeParse(input);

    if (!result.success) {
      const errorMessage = result.error.issues.map((e) => e.message).join(', ');
      throw new GraphQLError(`バリデーションエラー: ${errorMessage}`);
    }

    const validData = result.data;
    const hashedPassword = await hashPassword(validData.password);
    const newSlug = crypto.randomUUID();

    const newUser = await userRepository.create({
      name: validData.name,
      slug: newSlug,
      email: validData.email,
      password: hashedPassword,
      role: validData.role,
    });

    return newUser;
  };
};
