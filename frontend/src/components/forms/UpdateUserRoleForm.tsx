import { USER_ROLES } from '@dc-hono-demo/shared/constants/roles';
import { type UpdateUserRoleDto, updateUserRoleSchema } from '@dc-hono-demo/shared/schemas/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'urql';
import { Field } from '@/components/Field';
import { toaster } from '@/components/toaster-instance';
import { graphql } from '@/gql/index';
import { Box, Button, Heading, NativeSelect, Stack } from '@/libs/chakra';

const UPDATE_USER_ROLE_MUTATION = graphql(`
  mutation UpdateUserRole($input: UpdateUserRoleInput!) {
    updateUserRole(input: $input) {
      id
      role
    }
  }
`);

export const UpdateUserRoleForm = ({
  user,
  onSuccess,
}: {
  user: {
    id: number;
    role: 0 | 1;
  };
  onSuccess?: () => void;
}) => {
  const navigate = useNavigate();
  const [, executeMutation] = useMutation(UPDATE_USER_ROLE_MUTATION);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserRoleDto>({
    defaultValues: {
      id: user.id,
      role: user.role,
    },
    resolver: zodResolver(updateUserRoleSchema),
  });

  const onSubmit = async (data: UpdateUserRoleDto) => {
    const result = await executeMutation({
      input: {
        id: data.id,
        role: data.role,
      },
    });

    if (result.error) {
      toaster.create({
        title: '更新失敗',
        description: result.error.message,
        type: 'error',
      });
      return;
    }

    if (result.data?.updateUserRole) {
      toaster.create({
        title: '更新成功',
        description: 'ユーザー情報を更新しました',
        type: 'success',
      });

      onSuccess?.();
      navigate('/admin');
    }
  };

  return (
    <Stack p={8} gap={6}>
      <Heading size="xl" textAlign="center">
        ユーザー情報更新
      </Heading>

      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={4}>
          <Field label="権限" invalid={!!errors.role} errorText={errors.role?.message}>
            <NativeSelect.Root>
              <NativeSelect.Field
                {...register('role', {
                  valueAsNumber: true,
                })}
              >
                <option value={USER_ROLES.NORMAL}>一般</option>
                <option value={USER_ROLES.ADMIN}>管理</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field>

          <Button type="submit" colorScheme="blue" width="full" mt={4} loading={isSubmitting}>
            更新する
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};
