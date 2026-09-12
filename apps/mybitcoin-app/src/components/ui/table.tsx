import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

/** HTML `<table>` não existe em RN — colunas tabulares aqui são `View`s
 * flex-row dentro de um `ScrollView` horizontal (para telas estreitas). */
function Table({ className, children, ...props }: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className={cn('min-w-full flex-col', className)} {...props}>
        {children}
      </View>
    </ScrollView>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  return <View className={cn('flex-row border-b border-border', className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  return <View className={cn('flex-col', className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  return (
    <View
      className={cn('flex-row items-center border-b border-border px-2 active:bg-muted/50', className)}
      {...props}
    />
  );
}

function TableHead({
  className,
  children,
  ...props
}: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  return (
    <View className={cn('min-w-[96px] flex-1 px-2 py-3', className)} {...props}>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text className="text-xs font-medium text-muted-foreground">{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

function TableCell({
  className,
  children,
  ...props
}: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  return (
    <View className={cn('min-w-[96px] flex-1 px-2 py-3', className)} {...props}>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text className="text-sm text-foreground">{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
