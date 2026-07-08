import { useState } from 'react';
import SimpleDialog from '@/components/dialogs/SimpleDialog';
import LoginForm from '@/components/forms/LoginForm';
import { Box, Heading, HStack, Link } from '@/libs/chakra';

export const Header = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <HStack px="4" py="2" justifyContent="flex-end" alignItems="center">
        <Link onClick={() => setIsDialogOpen(true)}>ログイン</Link>
      </HStack>
      <Box px="4" py="2" backgroundColor="black">
        <Heading fontSize="4xl" fontWeight="bold" color="white">
          Cinema Review
        </Heading>
      </Box>
      <SimpleDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <LoginForm />
      </SimpleDialog>
    </>
  );
};
