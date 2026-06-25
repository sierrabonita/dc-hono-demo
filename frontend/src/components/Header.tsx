import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'urql';
import ConfirmDialog from '@/components/ConfirmDialog';
import { graphql } from '@/gql/index';
import { Badge, Button, Flex, Heading, Text } from '@/libs/chakra';

const ME_QUERY = graphql(`
  query Me {
    me {
      id
      name
      role
    }
  }
`);

const LOGOUT_MUTATION = graphql(`
  mutation Logout {
    logout
  }
`);

export const Header = () => {
  const navigate = useNavigate();
  const [{ data, fetching }] = useQuery({ query: ME_QUERY });
  const [, executeMutation] = useMutation(LOGOUT_MUTATION);

  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleClickAccept = async () => {
    try {
      setIsLoggingOut(true);

      await executeMutation({});
      navigate('/');
    } catch (error) {
      console.error('ログアウト中にエラーが発生しました:', error);
      setIsLoggingOut(false);
    }
  };

  const isAdmin = data?.me?.role === 1;

  console.log('data: ', data);
  console.log('isAdmin: ', isAdmin);

  return (
    <>
      <Flex
        as="header"
        width="100%"
        height="80px"
        alignItems="center"
        justifyContent="space-between"
        px={8}
        borderBottomWidth={1}
        bg="white"
        boxShadow="sm"
      >
        <Flex alignItems="center" gap={4}>
          <Heading size="md">
            <RouterLink to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
              Cinema Review
            </RouterLink>
          </Heading>
          {isAdmin && (
            <Badge
              color="red.600"
              bg="red.50"
              borderWidth={1}
              borderColor="red.200"
              px={2}
              py={0.5}
              borderRadius="md"
            >
              管理者
            </Badge>
          )}
        </Flex>

        <Flex alignItems="center" gap={6}>
          {!fetching && data?.me && (
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              ログインユーザー <br />
              {data.me.name}さん
            </Text>
          )}
          <Button onClick={() => setIsOpenDialog(true)} variant="outline">
            ログアウト
          </Button>
        </Flex>
      </Flex>
      <ConfirmDialog
        textBody={'ログアウトします。よろしいですか？'}
        textTitle={'ログアウト確認'}
        isOpen={isOpenDialog}
        isLoading={isLoggingOut}
        onOpenChange={setIsOpenDialog}
        onClickConfirm={handleClickAccept}
      />
    </>
  );
};
