import { Image } from 'expo-image';
import { LogOut } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ThemeToggle } from '@/components/theme-toggle';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ICON_MUTED_FOREGROUND } from '@/lib/icon-colors';

interface TopbarProps {
  userName: string;
}

/**
 * Cabeçalho de topo — porte do `topbar.tsx` do `../mybitcoin-front`, sem os
 * links de navegação: no mobile a navegação real já é a tab bar nativa
 * (`app-tabs.tsx`), então duplicar links aqui seria redundante. Fica só
 * logo + tema + usuário, pro mesmo propósito de "dar a noção da tela".
 * Protótipo — logout aqui não desloga nada de verdade.
 */
export function Topbar({ userName }: TopbarProps) {
  const colorScheme = useColorScheme();
  const iconColor = ICON_MUTED_FOREGROUND[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView edges={['top']} className="border-border bg-card border-b">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Image
          source={
            colorScheme === 'dark'
              ? require('@/assets/images/white.svg')
              : require('@/assets/images/base.svg')
          }
          contentFit="contain"
          accessibilityLabel="mybitcoin"
          style={styles.logo}
        />

        <View className="flex-row items-center gap-1">
          <ThemeToggle />
          <Text className="text-muted-foreground mr-1 text-sm">{userName}</Text>
          <Button variant="ghost" size="icon" className="size-11" accessibilityLabel="Sair">
            <LogOut size={18} color={iconColor} />
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 110,
    height: 30,
  },
});
