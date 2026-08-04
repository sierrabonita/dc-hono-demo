import {
  type SendVerificationEmailFormDto,
  sendVerificationEmailFormSchema,
} from '@dc-hono-demo/shared/schemas/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuMailCheck } from 'react-icons/lu';
import { useMutation } from 'urql';
import { TextButton } from '@/components/buttons/TextButton';
import { Field } from '@/components/Field';
import { toaster } from '@/components/toaster-instance';
import { graphql } from '@/gql/index';
import { Box, Button, Center, Flex, Heading, Input, Stack, Text } from '@/libs/chakra';

const SEND_VERIFICATION_EMAIL_MUTATION = graphql(`
  mutation SendVerificationEmail($input: SendVerificationEmailInput!) {
    sendVerificationEmail(input: $input)
  }
`);

type Props = {
  setDialogType: (type: 'login' | 'signup' | null) => void;
};

export const SignUpEmailForm = ({ setDialogType }: Props) => {
  const [isSent, setIsSent] = useState(false);
  const [, executeMutation] = useMutation(SEND_VERIFICATION_EMAIL_MUTATION);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    getValues,
  } = useForm<SendVerificationEmailFormDto>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      emailConfirm: '',
    },
    resolver: zodResolver(sendVerificationEmailFormSchema),
  });

  const onSubmit = async (data: SendVerificationEmailFormDto) => {
    const result = await executeMutation({
      input: {
        email: data.email,
      },
    });

    if (result.error) {
      toaster.create({
        title: '登録メール送信失敗',
        description: result.error.message,
        type: 'error',
      });
      return;
    }

    if (result.data?.sendVerificationEmail) {
      setIsSent(true);
      toaster.create({
        title: '認証メール送信完了',
        description: '入力されたメールアドレスに登録案内を送信しました。',
        type: 'success',
      });
    }
  };

  if (isSent) {
    return (
      <Stack p={8} gap={6} align="center" textAlign="center">
        <Center w="16" h="16" borderRadius="full" bg="green.50">
          <LuMailCheck size={40} color="green" />
        </Center>
        <Heading size="xl">仮登録完了</Heading>
        <Text color="gray.600">
          <strong>{getValues('email')}</strong> 宛てに認証メールを送信しました。
        </Text>
        <Text fontSize="sm" color="gray.500">
          メール内の確認リンクをクリックして、新規登録を完了してください。
          <br />
          ※確認リンクの有効期限は1時間です。
        </Text>
      </Stack>
    );
  }

  return (
    <Stack p={8} gap={6}>
      <Heading size="xl" textAlign="center">
        新規登録
      </Heading>

      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={4}>
          <Field label="メールアドレス" invalid={!!errors.email} errorText={errors.email?.message}>
            <Input type="email" placeholder="example@test.com" {...register('email')} />
          </Field>

          <Field
            label="メールアドレス（確認用）"
            invalid={!!errors.emailConfirm}
            errorText={errors.emailConfirm?.message}
          >
            <Input type="email" placeholder="もう一度入力" {...register('emailConfirm')} />
          </Field>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            mt={4}
            loading={isSubmitting}
            disabled={!isValid}
          >
            新規登録する
          </Button>
        </Stack>
      </Box>
      <Flex justifyContent="right">
        <TextButton text="登録済の方はこちら" onClick={() => setDialogType('login')} />
      </Flex>
    </Stack>
  );
};
