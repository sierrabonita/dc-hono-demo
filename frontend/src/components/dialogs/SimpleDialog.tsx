'use client';
import { CloseButton, Dialog, Portal } from '@/libs/chakra';

type Props = {
  isOpen: boolean;
  onOpenChange: (state: boolean) => void;
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'cover' | 'full';
};

const SimpleDialog = (props: Props) => {
  const { isOpen, onOpenChange, children, title, footer, size = 'md' } = props;

  return (
    <Dialog.Root size={size} open={isOpen} onOpenChange={(e) => onOpenChange(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            {title && (
              <Dialog.Header>
                <Dialog.Title>{title}</Dialog.Title>
              </Dialog.Header>
            )}
            <Dialog.Body>{children}</Dialog.Body>
            {footer && <Dialog.Footer>{footer}</Dialog.Footer>}
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default SimpleDialog;
