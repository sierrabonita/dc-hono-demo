import { Center, Flex, Heading, Link, Stack } from '@/libs/chakra';
import LoginForm from './_components/LoginForm';

const Login = () => {
  return (
    <Center minH="100vh">
      <Stack gap="4">
        <Heading fontSize="4xl" fontWeight="bold">
          Cinema Review
        </Heading>
        <LoginForm />
        <Flex justifyContent={'right'}>
          <Link href="/signUp/" variant={'plain'} _hover={{ textDecoration: 'none' }}>
            Sign Up?
          </Link>
        </Flex>
      </Stack>
    </Center>
  );
};

export default Login;
