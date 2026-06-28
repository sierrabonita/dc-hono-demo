import { useState } from 'react';
import type { ReviewsQuery } from '@/gql/graphql';
import { Flex, HStack, List, Text } from '@/libs/chakra';

type ReviewListProps = {
  data?: ReviewsQuery;
};

type ReviewListItemProps = {
  key: number;
  review: ReviewsQuery['reviews'][0];
};

const ReviewListItem = ({ key, review }: ReviewListItemProps) => {
  const [isContextSpoilerOpen, setIsContextSpoilerOpen] = useState(false);

  return (
    <List.Item key={key} pb="1rem" listStyle="none">
      <HStack justifyContent="space-between">
        <Text fontWeight="bold" fontSize="md">
          {review.movie.title}
        </Text>
        <Text fontSize="xs">{review.createdAt}</Text>
      </HStack>
      {review.isSpoiler ? (
        <>
          <Text onClick={() => setIsContextSpoilerOpen((prev) => !prev)}>ネタバレあり</Text>
          <Text fontSize="md">{isContextSpoilerOpen ? review.content : '...'}</Text>
        </>
      ) : (
        <Text fontSize="md">{review.content}</Text>
      )}
      <Flex justifyContent="flex-end">
        <Text fontSize="xs">{review.user.name}</Text>
      </Flex>
    </List.Item>
  );
};

export const ReviewList = ({ data }: ReviewListProps) => {
  return (
    <List.Root>
      {data?.reviews.map((review) => (
        <ReviewListItem key={review.id} review={review} />
      ))}
    </List.Root>
  );
};
