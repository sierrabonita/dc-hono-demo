import { useQuery } from 'urql';
import { ReviewList } from '@/components/lists/ReviewList';
import { graphql } from '@/gql/index';
import { Box, Center, Heading, Spinner } from '@/libs/chakra';

const ME_QUERY = graphql(`
  query GetMyProfileWithReviews {
    me {
      id
      name
      reviews {
        ...ReviewListFields
      }
    }
  }
`);

export const Home = () => {
  const [{ data, fetching }] = useQuery({ query: ME_QUERY });

  if (fetching) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  const reviews = data?.me?.reviews;

  if (!reviews) {
    return <Box>レビューがありません</Box>;
  }

  return (
    <Box>
      <Heading mb={4}>レビュー履歴</Heading>
      <ReviewList reviews={reviews} />
    </Box>
  );
};
