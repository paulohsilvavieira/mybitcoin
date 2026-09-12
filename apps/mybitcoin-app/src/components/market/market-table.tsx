import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Text } from '@/components/ui/text';
import { AssetIcon, assetLabel } from '@/components/wallet/asset-icon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ICON_MUTED_FOREGROUND } from '@/lib/icon-colors';
import { cn } from '@/lib/utils';
import type { MarketCoin } from '@/types/market';

type SortKey = 'price' | 'changePercent24h' | 'volume24h';
interface SortState {
  key: SortKey;
  direction: 'asc' | 'desc';
}

function formatBrl(value: string): string {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

interface SortableHeadProps {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
}

/** Cabeçalho tocável — RN não tem `:hover` pra dar affordance de coluna
 * ordenável, então o indicador é o ícone de seta que só aparece na coluna ativa. */
function SortableHead({ label, sortKey, sort, onSort }: SortableHeadProps) {
  const colorScheme = useColorScheme();
  const iconColor = ICON_MUTED_FOREGROUND[colorScheme === 'dark' ? 'dark' : 'light'];
  const isActive = sort.key === sortKey;
  const Icon = sort.direction === 'desc' ? ChevronDown : ChevronUp;

  return (
    <Pressable
      onPress={() => onSort(sortKey)}
      accessibilityRole="button"
      accessibilityLabel={`Ordenar por ${label}`}
      className="min-h-11 min-w-[96px] flex-1 flex-row items-center gap-1 px-2 py-3"
    >
      <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
      {isActive && <Icon size={12} color={iconColor} />}
    </Pressable>
  );
}

interface MarketTableProps {
  coins: MarketCoin[];
}

/**
 * Lista de mercado — porte de `components/market/market-table.tsx` do
 * `../mybitcoin-front`. Usa as primitivas de `ui/table.tsx` (colunas em
 * `View`/flex dentro de `ScrollView` horizontal, já que RN não tem
 * `<table>`). Toque no cabeçalho ordena; toque de novo na mesma coluna
 * inverte a direção.
 */
export function MarketTable({ coins }: MarketTableProps) {
  const [sort, setSort] = useState<SortState>({ key: 'changePercent24h', direction: 'desc' });

  function handleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' } : { key, direction: 'desc' },
    );
  }

  if (coins.length === 0) {
    return (
      <View className="items-center gap-1 py-8">
        <Text className="font-sans-medium">Nenhum mercado disponível</Text>
        <Text className="text-sm text-muted-foreground">Os mercados ativos aparecem aqui.</Text>
      </View>
    );
  }

  const sorted = [...coins].sort((a, b) => {
    const diff = sort.key === 'changePercent24h' ? a.changePercent24h - b.changePercent24h : Number(a[sort.key]) - Number(b[sort.key]);
    return sort.direction === 'asc' ? diff : -diff;
  });

  return (
    <Table>
      <TableHeader>
        <TableHead className="min-w-[140px]">Ativo</TableHead>
        <SortableHead label="Preço" sortKey="price" sort={sort} onSort={handleSort} />
        <SortableHead label="Var. 24h" sortKey="changePercent24h" sort={sort} onSort={handleSort} />
        <SortableHead label="Vol. 24h" sortKey="volume24h" sort={sort} onSort={handleSort} />
      </TableHeader>
      <TableBody>
        {sorted.map((coin) => {
          const isPositive = coin.changePercent24h >= 0;
          return (
            <TableRow key={coin.pair}>
              <TableCell className="min-w-[140px]">
                <View className="flex-row items-center gap-2">
                  <AssetIcon asset={coin.asset} className="size-7" />
                  <View className="min-w-0">
                    <Text className="font-sans-semibold text-sm">{coin.asset}</Text>
                    <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                      {assetLabel(coin.asset)}
                    </Text>
                  </View>
                </View>
              </TableCell>
              <TableCell>
                <Text className="font-mono text-sm">R$ {formatBrl(coin.price)}</Text>
              </TableCell>
              <TableCell>
                <Text className={cn('font-mono text-sm', isPositive ? 'text-success' : 'text-destructive')}>
                  {isPositive ? '+' : ''}
                  {coin.changePercent24h.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
                </Text>
              </TableCell>
              <TableCell>
                <Text className="font-mono text-sm text-muted-foreground">{coin.volume24h}</Text>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
