import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Topbar } from '@/components/layout/topbar';
import { BalanceRows } from '@/components/wallet/balance-list';
import { Text } from '@/components/ui/text';
import type { Balance } from '@/types/wallet';

// `formatSatoshi()` (FIN-002) só sabe formatar BTC — igual à API real hoje.
// Nada de mockar outros ativos aqui: mostraria "BTC" grudado em valor que
// não é BTC. Mesmo mock do `wallet-preview-page.tsx` do front.
const MOCK_BALANCES: Balance[] = [
  { asset: 'BTC', available: '15000000', locked: '2500000', total: '17500000' },
];

/**
 * Porte de `pages/wallet-preview-page.tsx` do `../mybitcoin-front`. Preview
 * visual da carteira com dados mocados, sem exigir login — ver guarda em
 * `_layout.tsx`. Não é rota de produto.
 */
export default function PreviewWalletScreen() {
  return (
    <View className="bg-background flex-1">
      <Topbar userName="Ana Beatriz" />
      <ScrollView contentContainerClassName="p-4 gap-6">
        <View className="gap-1">
          <Text className="font-sans-semibold text-lg">Carteira (preview)</Text>
          <Text className="text-muted-foreground text-sm">
            Dados mocados — só em desenvolvimento, sem login.
          </Text>
        </View>
        <BalanceRows balances={MOCK_BALANCES} />
      </ScrollView>
      <SafeAreaView edges={['bottom']} />
    </View>
  );
}
