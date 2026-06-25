import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'urql';
import ConfirmDialog from '@/components/ConfirmDialog';
import { graphql } from '@/gql/index';
import { Box, Button, Heading } from '@/libs/chakra';

const LOGOUT_MUTATION = graphql(`
  mutation Logout {
    logout
  }
`);

const Admin = () => {
  const navigate = useNavigate();
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

  return (
    <>
      <Box p={8} textAlign="center">
        <Heading mb={4}>管理者画面</Heading>
        <Button onClick={() => setIsOpenDialog(true)}>{'ログアウト'}</Button>
      </Box>
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

export default Admin;
