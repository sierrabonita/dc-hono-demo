import type { ReviewRepository } from '@/domain/repositories/review.repository';
import type { UserRepository } from '@/domain/repositories/user.repository';

export const getMeUseCase = (
  userRepository: UserRepository,
  reviewRepository: ReviewRepository,
) => {
  return async (userId: number) => {
    const user = await userRepository.findById(userId);
    if (!user) return null;

    return {
      ...user,
      reviews: async () => {
        return await reviewRepository.findByUserIdWithRelations(user.id);
      },
    };
  };
};
