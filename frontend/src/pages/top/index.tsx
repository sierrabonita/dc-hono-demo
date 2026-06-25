import { useState } from 'react';
import SimpleDialog from '@/components/dialogs/SimpleDialog';
import LoginForm from '@/components/forms/LoginForm';
import { Box, Button, Center, Heading } from '@/libs/chakra';

const Top = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Box position="absolute" top="4" right="4">
        <Button onClick={() => setIsDialogOpen(true)}>Open Modal</Button>
      </Box>
      <Center w="full">
        <Heading fontSize="4xl" fontWeight="bold">
          Cinema Review
        </Heading>
      </Center>
      <SimpleDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <LoginForm />
      </SimpleDialog>
    </>
  );
};

export default Top;
