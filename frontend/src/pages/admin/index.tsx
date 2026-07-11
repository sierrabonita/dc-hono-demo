import { useQuery } from 'urql';
import { type FragmentType, graphql, useFragment } from '@/gql/index';
import { Center, Container, Heading, HStack, Link, Spinner, Table, Text } from '@/libs/chakra';

const USER_TABLE_FIELDS = graphql(`
  fragment UserTableFields on User {
    id
    name
    email
    role
    createdAt
  }
`);

const USER_QUERY = graphql(`
  query Users {
    users {
      ...UserTableFields
    }
  }
`);

const UserTable = ({ users }: { users: FragmentType<typeof USER_TABLE_FIELDS>[] }) => {
  const usersData = useFragment(USER_TABLE_FIELDS, users);

  const getRoleLabel = (role: number) => {
    switch (role) {
      case 0:
        return '一般';
      case 1:
        return '管理';
      default:
        return '不明';
    }
  };

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>名前</Table.ColumnHeader>
          <Table.ColumnHeader>メールアドレス</Table.ColumnHeader>
          <Table.ColumnHeader>権限</Table.ColumnHeader>
          <Table.ColumnHeader>登録日時</Table.ColumnHeader>
          <Table.ColumnHeader></Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {usersData.length > 0 ? (
          usersData.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>{user.name}</Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>{getRoleLabel(user.role)}</Table.Cell>
              <Table.Cell>{user.createdAt}</Table.Cell>
              <Table.Cell>
                <HStack>
                  <Link>削除</Link>
                  <Link>編集</Link>
                </HStack>
              </Table.Cell>
            </Table.Row>
          ))
        ) : (
          <Text>ユーザーがいません</Text>
        )}
      </Table.Body>
    </Table.Root>
  );
};

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
