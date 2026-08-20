import { useQuery } from 'urql';
import { graphql } from '@/gql/index';
import { Box, Center, Heading, Spinner } from '@/libs/chakra';
import { ReviewList } from '@/pages/home/_components/ReviewList';

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
