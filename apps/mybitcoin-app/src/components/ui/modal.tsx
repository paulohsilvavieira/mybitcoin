import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Modal as RNModal, Pressable, View, type ModalProps as RNModalProps } from 'react-native';

type ModalProps = Omit<RNModalProps, 'transparent' | 'animationType' | 'visible'> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
};

/** Equivalente nativo de "dialog" — usa o `Modal` do RN em vez de um portal
 * web (não existe overlay/portal DOM em RN). */
function Modal({ open, onOpenChange, children, onRequestClose, ...props }: ModalProps) {
  return (
    <RNModal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={(event) => {
        onOpenChange(false);
        onRequestClose?.(event);
      }}
      {...props}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/50 p-4"
        onPress={() => onOpenChange(false)}>
        <Pressable className="w-full max-w-sm" onPress={(event) => event.stopPropagation()}>
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

function ModalContent({ className, ...props }: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  return (
    <View
      className={cn(
        'w-full gap-4 rounded-xl border border-border bg-card p-6 shadow-sm shadow-black/10',
        className
      )}
      {...props}
    />
  );
}

function ModalHeader({ className, ...props }: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  return <View className={cn('gap-1.5', className)} {...props} />;
}

function ModalTitle({ className, ...props }: React.ComponentProps<typeof Text> & React.RefAttributes<typeof Text>) {
  return (
    <Text
      role="heading"
      aria-level={2}
      className={cn('text-lg font-semibold text-foreground', className)}
      {...props}
    />
  );
}

function ModalDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text> & React.RefAttributes<typeof Text>) {
  return <Text className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function ModalFooter({ className, ...props }: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  return <View className={cn('flex-row justify-end gap-2', className)} {...props} />;
}

export { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle };
export type { ModalProps };
