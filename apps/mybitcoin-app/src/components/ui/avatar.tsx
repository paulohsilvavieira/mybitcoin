import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Image } from 'expo-image';
import * as React from 'react';
import { View } from 'react-native';

type AvatarProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View> & {
    size?: number;
  };

function Avatar({ className, size = 40, style, ...props }: AvatarProps) {
  return (
    <View
      className={cn('items-center justify-center overflow-hidden rounded-full bg-muted', className)}
      style={[{ width: size, height: size }, style]}
      {...props}
    />
  );
}

type AvatarImageProps = React.ComponentProps<typeof Image>;

function AvatarImage({ className, ...props }: AvatarImageProps) {
  return <Image className={cn('h-full w-full', className)} {...props} />;
}

type AvatarFallbackProps = React.ComponentProps<typeof View> & React.RefAttributes<View>;

function AvatarFallback({ className, children, ...props }: AvatarFallbackProps) {
  return (
    <View className={cn('h-full w-full items-center justify-center bg-muted', className)} {...props}>
      <Text className="text-sm font-medium text-muted-foreground">{children}</Text>
    </View>
  );
}

export { Avatar, AvatarFallback, AvatarImage };
export type { AvatarProps };
