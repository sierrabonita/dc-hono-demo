import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Box, Flex } from '@/libs/chakra';

export const AuthLayout = () => {
  return (
    <Flex direction="column" minHeight="100vh" bg="gray.50">
      <Header />
      <Box flex="1" p={8}>
        <Outlet />
      </Box>
    </Flex>
  );
};
