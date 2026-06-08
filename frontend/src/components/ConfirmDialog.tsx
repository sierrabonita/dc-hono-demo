'use client';
import { Button, CloseButton, Dialog, Portal } from '@/libs/chakra';

type Props = {
  textBody: string;
  textTitle: string;
  isOpen: boolean;
  onOpenChange: (state: boolean) => void;
  onClickConfirm: () => void;
  buttonTextConfirm?: string;
  buttonTextCancel?: string;
  isLoading?: boolean;
};

const ConfirmDialog = (props: Props) => {
  const {
    textBody,
    textTitle,
    isOpen,
    onOpenChange,
    onClickConfirm,
    buttonTextConfirm = 'OK',
    buttonTextCancel = 'キャンセル',
    isLoading,
  } = props;

  return (
    <Dialog.Root size={'md'} open={isOpen} onOpenChange={(e) => onOpenChange(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{textTitle}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <p>{textBody}</p>
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
