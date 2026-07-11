import { Outlet } from 'react-router-dom';
import { AuthHeader } from '@/components/AuthHeader';
import { Box, Flex } from '@/libs/chakra';

export const AuthLayout = () => {
  return (
    <Flex direction="column" minHeight="100vh" bg="gray.50">
      <AuthHeader />
      <Box flex="1" p={8}>
        <Outlet />
      </Box>
    </Flex>
  );
};
