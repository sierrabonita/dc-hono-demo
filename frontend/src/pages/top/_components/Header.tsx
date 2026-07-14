import { useState } from 'react';
import { BiSolidCameraMovie } from 'react-icons/bi';
import { TextButton } from '@/components/buttons/TextButton';
import SimpleDialog from '@/components/dialogs/SimpleDialog';
import LoginForm from '@/components/forms/LoginForm';
import SignUpEmailForm from '@/components/forms/SignUpEmailForm';
import { Heading, HStack } from '@/libs/chakra';

type DialogType = 'login' | 'signup' | null;

export const Header = () => {
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const isDialogOpen = dialogType !== null;
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setDialogType(null);
    }
  };

  return (
    <>
      <HStack px="4" py="2" justifyContent="flex-end" alignItems="center">
        <TextButton text="新規登録" onClick={() => setDialogType('signup')} />
        <TextButton text="ログイン" onClick={() => setDialogType('login')} />
      </HStack>
      <HStack px="4" py="2" backgroundColor="black">
        <BiSolidCameraMovie color="yellow" size="48" />
        <Heading fontSize="4xl" fontWeight="bold" color="white">
          Cinema Review
        </Heading>
      </HStack>
      <SimpleDialog isOpen={isDialogOpen} onOpenChange={handleOpenChange}>
        {dialogType === 'login' && <LoginForm />}
        {dialogType === 'signup' && <SignUpEmailForm />}
      </SimpleDialog>
    </>
  );
};
