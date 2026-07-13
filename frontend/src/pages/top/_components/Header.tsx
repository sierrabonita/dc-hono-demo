import { useState } from 'react';
import { BiSolidCameraMovie } from 'react-icons/bi';
import { TextButton } from '@/components/buttons/TextButton';
import SimpleDialog from '@/components/dialogs/SimpleDialog';
import LoginForm from '@/components/forms/LoginForm';
import { Heading, HStack } from '@/libs/chakra';

export const Header = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <HStack px="4" py="2" justifyContent="flex-end" alignItems="center">
        <TextButton text="ログイン" onClick={() => setIsDialogOpen(true)} />
      </HStack>
      <HStack px="4" py="2" backgroundColor="black">
        <BiSolidCameraMovie color="yellow" size="48" />
        <Heading fontSize="4xl" fontWeight="bold" color="white">
          Cinema Review
        </Heading>
      </HStack>
      <SimpleDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <LoginForm />
      </SimpleDialog>
    </>
  );
};
