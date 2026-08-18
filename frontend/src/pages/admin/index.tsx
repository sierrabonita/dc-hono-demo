import { useQuery } from 'urql';
import { UserTable } from '@/components/tables/UserTable';
import { graphql } from '@/gql/index';

import { Center, Container, Heading, Spinner } from '@/libs/chakra';

const USER_QUERY = graphql(`
  query Users {
    users {
      ...UserTableFields
    }
  }
`);

export const Admin = () => {
  const [{ data, fetching }] = useQuery({ query: USER_QUERY });

  if (fetching) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  const users = data?.users ?? [];

  return (
    <Container>
      <Heading mb={4}>ユーザー一覧</Heading>
      <UserTable users={users} />
    </Container>
  );
};
