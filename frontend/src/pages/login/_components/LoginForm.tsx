import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'urql';
import { graphql } from '@/gql/index';
import { Box, Button, Container, Field, Heading, Input, Stack } from '@/libs/chakra';
import { toaster } from '@/libs/chakra/toaster-instance';
import { type LoginDto, loginSchema } from '@/schemas/loginSchema';

const LOGIN_MUTATION = graphql(`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        name
        role
      }
    }
  }
`);

const LoginForm = () => {
  const navigate = useNavigate();
  const [, executeMutation] = useMutation(LOGIN_MUTATION);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginDto) => {
    const result = await executeMutation({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      toaster.create({
        title: 'ログイン失敗',
        description: result.error.message,
        type: 'error',
      });
      return;
    }

    if (result.data?.login) {
      toaster.create({
        title: 'ログイン成功',
        description: `${result.data.login.user.name}さん、ようこそ！`,
        type: 'success',
      });

      navigate('/home');
    }
  };

  return (
    <Container maxW="md" py={12}>
      <Box p={8} borderWidth={1} borderRadius="lg" boxShadow="md" bg="white">
        <Stack gap={6}>
          <Heading size="xl" textAlign="center">
            ログイン
          </Heading>

          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={4}>
              <Field
                label="メールアドレス"
                invalid={!!errors.email}
                errorText={errors.email?.message}
              >
                <Input
                  type="email"
                  placeholder="example@test.com"
                  {...register('email')} // react-hook-formに登録
                />
              </Field>

              <Field
                label="パスワード"
                invalid={!!errors.password}
                errorText={errors.password?.message}
              >
                <Input type="password" placeholder="パスワードを入力" {...register('password')} />
              </Field>

              <Button type="submit" colorScheme="blue" width="full" mt={4} loading={isSubmitting}>
                ログインする
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
};

export default LoginForm;
