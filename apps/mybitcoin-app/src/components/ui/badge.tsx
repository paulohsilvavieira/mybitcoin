import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';

const badgeVariants = {
  default: 'bg-primary border-transparent',
  secondary: 'bg-secondary border-transparent',
  destructive: 'bg-destructive border-transparent',
  success: 'bg-success border-transparent',
  outline: 'bg-transparent border-border',
} as const;

const badgeTextVariants = {
  default: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  destructive: 'text-destructive-foreground',
  success: 'text-success-foreground',
  outline: 'text-foreground',
} as const;

type BadgeVariant = keyof typeof badgeVariants;

type BadgeProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View> & {
    variant?: BadgeVariant;
    children?: React.ReactNode;
  };

function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <View
      className={cn(
        'flex-row items-center self-start rounded-full border px-2 py-0.5',
        badgeVariants[variant],
        className
      )}
      {...props}>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text className={cn('text-xs font-medium', badgeTextVariants[variant])}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export { Badge, badgeTextVariants, badgeVariants };
export type { BadgeProps, BadgeVariant };
