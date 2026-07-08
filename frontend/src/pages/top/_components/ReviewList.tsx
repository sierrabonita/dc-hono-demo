import { useState } from 'react';
import type { ReviewsQuery } from '@/gql/graphql';
import { Flex, Heading, HStack, List, Stack, Text } from '@/libs/chakra';

type ReviewListProps = {
  data?: ReviewsQuery;
};

type ReviewListItemProps = {
  review: ReviewsQuery['reviews'][0];
};

const ReviewListTitle = () => {
  return (
    <Heading fontSize="2xl" fontWeight="bold" textAlign="center">
      Latest Reviews
    </Heading>
  );
};

const ReviewListItem = ({ review }: ReviewListItemProps) => {
  const [isContextSpoilerOpen, setIsContextSpoilerOpen] = useState(false);

  return (
    <List.Item pb="1rem" listStyle="none">
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
    <Stack gap="2">
      <ReviewListTitle />
      <List.Root>
        {data?.reviews.map((review) => (
          <ReviewListItem key={review.id} review={review} />
        ))}
      </List.Root>
    </Stack>
  );
};
