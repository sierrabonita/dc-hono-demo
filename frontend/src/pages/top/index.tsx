import { useState } from 'react';
import { useQuery } from 'urql';
import SimpleDialog from '@/components/dialogs/SimpleDialog';
import LoginForm from '@/components/forms/LoginForm';
import { graphql } from '@/gql/index';
import { Button, Center, Flex, Heading, Spinner } from '@/libs/chakra';

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

  console.log('data:', data);

  return (
    <>
      <Flex w="full" p="1rem" alignItems="center" justifyContent="space-between">
        <Heading fontSize="4xl" fontWeight="bold">
          Cinema Review
        </Heading>
        <Button onClick={() => setIsDialogOpen(true)}>ログイン</Button>
      </Flex>
      <SimpleDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <LoginForm />
      </SimpleDialog>
    </>
  );
};

export default Top;
