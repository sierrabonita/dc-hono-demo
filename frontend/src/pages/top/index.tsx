import { useQuery } from 'urql';
import { graphql } from '@/gql/index';
import { Center, Container, Spinner } from '@/libs/chakra';
import { Header } from '@/pages/top/_components/Header';
import { LatestReviews } from '@/pages/top/_components/LatestReviews';

const LATEST_REVIEWS_QUERY = graphql(`
  query LatestReviews{
    reviews {
      id
      content
      isSpoiler
      createdAt
      user {
        name
      }
      movie{
        title
      }
    }
  }
`);

export const Top = () => {
  const [{ data, fetching }] = useQuery({ query: LATEST_REVIEWS_QUERY });

  if (fetching) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <>
      <Header />
      <Container maxW="lg">
        <LatestReviews data={data} />
      </Container>
    </>
  );
};
