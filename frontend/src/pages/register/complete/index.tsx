import {
  type RegisterCompleteDto,
  registerCompleteSchema,
} from '@dc-hono-demo/shared/schemas/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from 'urql';
import { Field } from '@/components/Field';
import { toaster } from '@/components/toaster-instance';
import { graphql } from '@/gql/index';
import { Box, Button, Center, Container, Heading, Input, Stack, Text } from '@/libs/chakra';
import { Header } from '@/pages/top/_components/Header';

const CREATE_USER_MUTATION = graphql(`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`);

export const RegisterComplete = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [, executeMutation] = useMutation(CREATE_USER_MUTATION);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCompleteDto>({
    defaultValues: {
      name: '',
      password: '',
    },
    resolver: zodResolver(registerCompleteSchema),
  });

  const onSubmit = async (data: RegisterCompleteDto) => {
    if (!token) {
      toaster.create({
        title: 'エラー',
        description: '無効なアクセスです。URLをご確認ください。',
        type: 'error',
      });
      return;
    }

    const result = await executeMutation({
      input: {
        token,
        name: data.name,
        password: data.password,
      },
    });

    if (result.error) {
      toaster.create({
        title: '登録失敗',
        description: result.error.message,
        type: 'error',
      });
      return;
    }

    toaster.create({
      title: '登録完了',
      description: '本登録が完了しました。',
      type: 'success',
    });

    // 登録成功したら home にリダイレクト
    navigate('/home');
  };

  if (!token) {
    return (
      <>
        <Header />
        <Container maxW="md" mt={10}>
          <Center flexDirection="column" gap={4}>
            <Heading size="lg" color="red.500">
              無効なリンク
            </Heading>
            <Text>トークンが見つかりません。再度メールのリンクからアクセスしてください。</Text>
          </Center>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxW="md" mt={10}>
        <Stack p={8} gap={6} bg="white" shadow="md" borderRadius="md">
          <Heading size="xl" textAlign="center">
            本登録
          </Heading>

          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={4}>
              <Field label="お名前" invalid={!!errors.name} errorText={errors.name?.message}>
                <Input placeholder="名前を入力" {...register('name')} />
              </Field>

              <Field
                label="パスワード"
                invalid={!!errors.password}
                errorText={errors.password?.message}
              >
                <Input type="password" placeholder="パスワードを入力" {...register('password')} />
              </Field>

              <Button type="submit" colorScheme="blue" width="full" mt={4} loading={isSubmitting}>
                登録を完了する
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </>
  );
};
