import { useState } from 'react';
import { useQuery } from 'urql';
import SimpleDialog from '@/components/dialogs/SimpleDialog';
import LoginForm from '@/components/forms/LoginForm';
import { graphql } from '@/gql/index';
import { Button, Center, Container, Flex, Heading, Spinner } from '@/libs/chakra';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (fetching) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <>
      <Flex w="full" p="1rem" alignItems="center" justifyContent="space-between">
        <Heading fontSize="4xl" fontWeight="bold">
          Cinema Review
        </Heading>
        <Button onClick={() => setIsDialogOpen(true)}>ログイン</Button>
      </Flex>
      <Container maxW="lg">
        <ReviewList data={data} />
      </Container>
      <SimpleDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <LoginForm />
      </SimpleDialog>
    </>
  );
};

export default Top;
