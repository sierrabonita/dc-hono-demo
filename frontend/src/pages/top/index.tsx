import { useQuery } from 'urql';
import { graphql } from '@/gql/index';
import { Center, Container, Spinner } from '@/libs/chakra';
import { Header } from '@/pages/top/_components/Header';
import { ReviewList } from '@/pages/top/_components/ReviewList';

const REVIEWS_QUERY = graphql(`
  query Reviews{
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

const Top = () => {
  const [{ data, fetching }] = useQuery({ query: REVIEWS_QUERY });

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
        <ReviewList data={data} />
      </Container>
    </>
  );
};

export default Top;
