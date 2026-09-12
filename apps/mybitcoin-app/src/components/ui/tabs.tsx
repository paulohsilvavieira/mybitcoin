import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error(`<Tabs.${component}> must be used within <Tabs>`);
  }
  return context;
}

type TabsProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View> & {
    value: string;
    onValueChange: (value: string) => void;
  };

/** Tabs sem lib externa — `useState`/context + `Pressable`, mesmo padrão dos
 * outros primitivos deste diretório (sem Radix, sem CVA). */
function Tabs({ value, onValueChange, className, children, ...props }: TabsProps) {
  const contextValue = React.useMemo(() => ({ value, setValue: onValueChange }), [value, onValueChange]);

  return (
    <TabsContext.Provider value={contextValue}>
      <View className={cn('flex flex-col gap-2', className)} {...props}>
        {children}
      </View>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  return (
    <View
      role="tablist"
      className={cn('flex-row items-center gap-1 self-start rounded-lg bg-muted p-1', className)}
      {...props}
    />
  );
}

type TabsTriggerProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> & { value: string };

function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const { value: activeValue, setValue } = useTabsContext('Trigger');
  const isActive = activeValue === value;

  return (
    <Pressable
      role="tab"
      accessibilityState={{ selected: isActive }}
      onPress={() => setValue(value)}
      className={cn(
        'items-center justify-center rounded-md px-3 py-1.5',
        isActive ? 'bg-background shadow-sm shadow-black/5' : 'active:bg-background/50',
        className
      )}
      {...props}>
      <Text className={cn('text-sm font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>
        {children as React.ReactNode}
      </Text>
    </Pressable>
  );
}

type TabsContentProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View> & { value: string };

function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { value: activeValue } = useTabsContext('Content');
  if (activeValue !== value) return null;

  return (
    <View className={cn('flex-1', className)} {...props}>
      {children}
    </View>
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
export type { TabsContentProps, TabsProps, TabsTriggerProps };
