import { useCallback, useState } from 'react';
import { IoOptions } from 'react-icons/io5';
import { SimpleDialog } from '@/components/dialogs/SimpleDialog';
import { UpdateUserRoleForm } from '@/components/forms/UpdateUserRoleForm';
import { type FragmentType, graphql, useFragment } from '@/gql/index';
import { Box, Table, Text } from '@/libs/chakra';

const USER_TABLE_FIELDS = graphql(`
  fragment UserTableFields on User {
    id
    name
    email
    role
    createdAt
  }
`);

export const UserTable = ({ users }: { users: FragmentType<typeof USER_TABLE_FIELDS>[] }) => {
  const usersData = useFragment(USER_TABLE_FIELDS, users);
  const [isOpenEditDialog, setIsOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<(typeof usersData)[number] | null>(null);

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

  const handleOnClick = (user: (typeof usersData)[number]) => {
    setSelectedUser(user);
    setIsOpenEditDialog(true);
  };

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpenEditDialog(open);
    if (!open) {
      setSelectedUser(null);
    }
  }, []);

  return (
    <>
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
                  <Box cursor="pointer" onClick={() => handleOnClick(user)}>
                    <IoOptions />
                  </Box>
                </Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Text>ユーザーがいません</Text>
          )}
        </Table.Body>
      </Table.Root>
      <SimpleDialog isOpen={isOpenEditDialog} onOpenChange={handleOpenChange}>
        {selectedUser && (
          <UpdateUserRoleForm
            user={{ id: selectedUser.id, role: selectedUser.role }}
            onSuccess={() => handleOpenChange(false)}
          />
        )}
      </SimpleDialog>
    </>
  );
};
