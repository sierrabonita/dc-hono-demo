import { type LoginDto, loginSchema } from '@dc-hono-demo/shared/schemas/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'urql';
import { Field } from '@/components/Field';
import { toaster } from '@/components/toaster-instance';
import { graphql } from '@/gql/index';
import { Box, Button, Heading, Input, Stack } from '@/libs/chakra';

const LOGIN_MUTATION = graphql(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
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
      input: {
        email: data.email,
        password: data.password,
      },
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

      if (result.data.login.user.role === 1) {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    }
  };

  return (
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
              <Input type="email" placeholder="example@test.com" {...register('email')} />
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
  );
};

export default LoginForm;
