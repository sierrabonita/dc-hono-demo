import { useState } from 'react';
import SimpleDialog from '@/components/dialogs/SimpleDialog';
import LoginForm from '@/components/forms/LoginForm';
import { Box, Button, Center, Heading } from '@/libs/chakra';

const Top = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
