import { useQuery } from 'urql';
import { graphql } from '@/gql/index';
import { Box, Center, Heading, List, Spinner, Text } from '@/libs/chakra';

const USER_QUERY = graphql(`
  query Users {
    users {
      id
      name
      email
      role
    }
  }
`);

const Admin = () => {
  const [{ data, fetching }] = useQuery({ query: USER_QUERY });

  if (fetching) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box>
      <Heading mb={4}>ユーザー一覧</Heading>
      {data.users.length > 0 ? (
        <List.Root>
          {data.users.map((user) => {
            if (user.role === 0) {
              return (
                <List.Item key={user.id} _marker={{ listStyle: 'none' }}>
                  {user.name}
                </List.Item>
              );
            }
            return null;
          })}
        </List.Root>
      ) : (
        <Text>ユーザーはいません</Text>
      )}
    </Box>
  );
};

export default Admin;
