import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type ToastVariant = 'default' | 'destructive' | 'success';

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type Listener = (items: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener(toasts));
}

/** Sistema simples de notificação temporária — sem lib externa. Chame
 * `toast({ title })` de qualquer lugar; monte `<Toaster />` uma vez perto da
 * raiz do app (ex: `src/app/_layout.tsx`) para renderizar as mensagens. */
function toast({ title, description, variant = 'default', duration = 4000 }: ToastInput) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  toasts = [...toasts, { id, title, description, variant }];
  notify();

  setTimeout(() => {
    toasts = toasts.filter((item) => item.id !== id);
    notify();
  }, duration);
}

const toastVariants: Record<ToastVariant, string> = {
  default: 'bg-card border-border',
  destructive: 'bg-destructive border-transparent',
  success: 'bg-success border-transparent',
};

const toastTextVariants: Record<ToastVariant, string> = {
  default: 'text-foreground',
  destructive: 'text-destructive-foreground',
  success: 'text-success-foreground',
};

function Toaster() {
  const [items, setItems] = React.useState<ToastItem[]>(toasts);

  React.useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <View pointerEvents="box-none" className="absolute inset-x-4 top-14 z-50 gap-2">
      {items.map((item) => (
        <Animated.View
          key={item.id}
          entering={FadeIn}
          exiting={FadeOut}
          className={cn('gap-1 rounded-lg border p-3 shadow-sm shadow-black/10', toastVariants[item.variant])}>
          <Text className={cn('text-sm font-medium', toastTextVariants[item.variant])}>{item.title}</Text>
          {item.description ? (
            <Text className={cn('text-xs', toastTextVariants[item.variant])}>{item.description}</Text>
          ) : null}
        </Animated.View>
      ))}
    </View>
  );
}

export { Toaster, toast };
export type { ToastInput, ToastItem, ToastVariant };
