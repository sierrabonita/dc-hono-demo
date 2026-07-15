import {
  type UpdateMeDto,
  type UpdateUserRoleDto,
  updateMeSchema,
  updateUserRoleSchema,
} from '@dc-hono-demo/shared/schemas/user';
import { GraphQLError } from 'graphql';
import type { DbUser, UserRepository } from '@/domain/repositories/user.repository';
import { hashPassword } from '@/utils/crypto';

export const updateMeUseCase = (userRepository: UserRepository) => {
  return async (userId: number, input: UpdateMeDto): Promise<DbUser> => {
    const result = updateMeSchema.safeParse(input);

    if (!result.success) {
      const errorMessage = result.error.issues.map((e) => e.message).join(', ');
      throw new GraphQLError(`バリデーションエラー: ${errorMessage}`);
    }

    const validData = result.data;

    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw new GraphQLError('更新対象のユーザーが見つかりません');
    }

    let finalPassword = existingUser.password;
    if (validData.password) {
      finalPassword = await hashPassword(validData.password);
    }

    const updatedUser = await userRepository.update(userId, {
      ...(validData.name && { name: validData.name }),
      ...(validData.email && { email: validData.email }),
      password: finalPassword,
    });

    return updatedUser;
  };
};

export const updateUserRoleUseCase = (userRepository: UserRepository) => {
  return async (input: UpdateUserRoleDto): Promise<DbUser> => {
    const result = updateUserRoleSchema.safeParse(input);

    if (!result.success) {
      const errorMessage = result.error.issues.map((e) => e.message).join(', ');
      throw new GraphQLError(`バリデーションエラー: ${errorMessage}`);
    }

    const validData = result.data;

    const existingUser = await userRepository.findById(validData.id);
    if (!existingUser) {
      throw new GraphQLError('更新対象のユーザーが見つかりません');
    }

    const updatedUser = await userRepository.update(validData.id, {
      role: validData.role,
    });

    return updatedUser;
  };
};

export const deleteUserUseCase = (userRepository: UserRepository) => {
  return async (id: number): Promise<DbUser> => {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new GraphQLError('削除対象のユーザーが見つかりません');
    }

    const deletedUser = await userRepository.delete(id);
    return deletedUser;
  };
};
