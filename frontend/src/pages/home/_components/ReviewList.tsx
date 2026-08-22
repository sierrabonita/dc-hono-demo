import { type FragmentType, graphql, useFragment } from '@/gql/index';
import { HStack, List, Text } from '@/libs/chakra';

const REVIEW_LIST_FIELDS = graphql(`
  fragment ReviewListFields on Review {
    id
    content
    createdAt
    movie {
      title
    }
  }
`);

type Props = { reviews: FragmentType<typeof REVIEW_LIST_FIELDS>[] };

export const ReviewList = (props: Props) => {
  const { reviews } = props;
  const reviewsData = useFragment(REVIEW_LIST_FIELDS, reviews);

  return (
    <List.Root>
      {reviewsData.map((review) => (
        <>
          <List.Item key={review.id} pb="1rem" listStyle="none">
            <HStack justifyContent="start" alignItems="flex-start">
              <Text fontSize="xs" whiteSpace="nowrap">
                {review.createdAt}
              </Text>
              <Text fontWeight="bold" fontSize="md">
                {review.movie.title}
              </Text>
              <Text>{review.content}</Text>
            </HStack>
          </List.Item>
        </>
      ))}
    </List.Root>
  );
};
