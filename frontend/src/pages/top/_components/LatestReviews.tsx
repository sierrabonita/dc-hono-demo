import { useState } from 'react';
import type { LatestReviewsQuery } from '@/gql/graphql';
import { Flex, Heading, HStack, List, Stack, Text } from '@/libs/chakra';

type LatestReviewsProps = {
  data?: LatestReviewsQuery;
};

type LatestReviewsItemProps = {
  review: LatestReviewsQuery['reviews'][0];
};

const LatestReviewsTitle = () => {
  return (
    <Heading fontSize="2xl" fontWeight="bold" textAlign="center">
      Latest Reviews
    </Heading>
  );
};

const LatestReviewsItem = ({ review }: LatestReviewsItemProps) => {
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

export const LatestReviews = ({ data }: LatestReviewsProps) => {
  return (
    <Stack gap="2">
      <LatestReviewsTitle />
      <List.Root>
        {data?.reviews.map((review) => (
          <LatestReviewsItem key={review.id} review={review} />
        ))}
      </List.Root>
    </Stack>
  );
};
