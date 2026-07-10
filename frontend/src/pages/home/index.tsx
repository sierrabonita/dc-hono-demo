import { useQuery } from 'urql';
import { graphql } from '@/gql/index';
import { Box, Center, Heading, HStack, List, Spinner, Text } from '@/libs/chakra';

const ME_QUERY = graphql(`
  query GetMyProfileWithReviews {
    me {
      id
      name
      reviews {
        id
        content
        createdAt
        movie {
          title
        }
      }
    }
  }
`);

const Home = () => {
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
      <List.Root>
        {reviews.map((review) => (
          <>
            <List.Item pb="1rem" listStyle="none">
              <HStack justifyContent="start">
                <Text fontSize="xs">{review.createdAt}</Text>
                <Text fontWeight="bold" fontSize="md">
                  {review.movie.title}
                </Text>
                <Text>{review.content}</Text>
              </HStack>
            </List.Item>
          </>
        ))}
      </List.Root>
    </Box>
  );
};

export default Home;
