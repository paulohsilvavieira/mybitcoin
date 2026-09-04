import { View } from 'react-native';

import { AssetIcon, assetLabel } from '@/components/wallet/asset-icon';
import { Text } from '@/components/ui/text';
import { formatSatoshi } from '@/lib/utils';
import type { Balance } from '@/types/wallet';

interface BalanceCardProps {
  balance: Balance;
}

/**
 * Porte de `components/wallet/balance-card.tsx` do `../mybitcoin-front`.
 * Linha de ativo no padrão de lista de exchange (Coinbase/Binance): selo
 * colorido + nome à esquerda, saldo disponível em destaque à direita.
 *
 * Valores exibidos exclusivamente via `formatSatoshi()` (FIN-002) — nunca
 * `Number()` sobre `available`/`locked`/`total` (FIN-001).
 *
 * "Bloqueado" só aparece quando há algo de fato bloqueado. "Total" não é
 * exibido: é derivável (disponível + bloqueado).
 */
export function BalanceCard({ balance }: BalanceCardProps) {
  const hasLocked = BigInt(balance.locked) > 0n;

  return (
    <View className="flex-row items-center gap-3 px-4 py-4">
      <AssetIcon asset={balance.asset} className="size-10" />

      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans-semibold text-base">{assetLabel(balance.asset)}</Text>
        <Text className="text-muted-foreground text-sm">{balance.asset}</Text>
      </View>

      <View className="items-end gap-0.5">
        <Text className="font-mono text-base font-medium">
          {formatSatoshi(balance.available)}
        </Text>
        {hasLocked && (
          <Text className="text-muted-foreground font-mono text-xs">
            {formatSatoshi(balance.locked)} bloqueado
          </Text>
        )}
      </View>
    </View>
  );
}
