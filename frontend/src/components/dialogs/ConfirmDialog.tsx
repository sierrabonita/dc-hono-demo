'use client';
import { Button, CloseButton, Dialog, Portal } from '@/libs/chakra';

type Props = {
  body: string;
  title: string;
  isOpen: boolean;
  onClickConfirm: () => void;
  onOpenChange: (state: boolean) => void;
  buttonTextCancel?: string;
  buttonTextConfirm?: string;
  isLoading?: boolean;
};

const ConfirmDialog = (props: Props) => {
  const {
    body,
    title,
    isOpen,
    onClickConfirm,
    onOpenChange,
    buttonTextCancel = 'キャンセル',
    buttonTextConfirm = 'OK',
    isLoading,
  } = props;

  return (
    <Dialog.Root size="md" open={isOpen} onOpenChange={(e) => onOpenChange(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <p>{body}</p>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">{buttonTextCancel}</Button>
              </Dialog.ActionTrigger>
              <Button onClick={onClickConfirm} loading={isLoading}>
                {buttonTextConfirm}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ConfirmDialog;
