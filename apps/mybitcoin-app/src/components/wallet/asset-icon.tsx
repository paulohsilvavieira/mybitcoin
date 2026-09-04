import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface AssetMeta {
  label: string;
  color: string;
  glyph: string;
}

/**
 * Porte de `components/wallet/asset-icon.tsx` do `../mybitcoin-front`. Cor
 * e símbolo reconhecíveis do próprio ativo (padrão Binance/Coinbase de
 * selo por moeda) — não é a cor de marca do produto. Ativo sem selo
 * dedicado cai no fallback por inicial.
 */
const ASSET_META: Record<string, AssetMeta> = {
  BTC: { label: 'Bitcoin', color: '#F7931A', glyph: '₿' },
};

export function assetLabel(asset: string): string {
  return ASSET_META[asset]?.label ?? asset;
}

interface AssetIconProps {
  asset: string;
  className?: string;
}

export function AssetIcon({ asset, className }: AssetIconProps) {
  const meta = ASSET_META[asset];

  return (
    <View
      accessible={false}
      className={cn('shrink-0 items-center justify-center rounded-full', className)}
      // `style` inline não resolve CSS custom properties (isso só acontece
      // via `className` do NativeWind) — por isso o fallback é um hex fixo,
      // não `var(--muted-foreground)`. Só entra em jogo pra ativo sem selo
      // dedicado, o que hoje não acontece (só BTC existe).
      style={{ backgroundColor: meta?.color ?? '#9AA1AC' }}
    >
      <Text className="font-sans-bold text-base text-white">{meta?.glyph ?? asset.slice(0, 1)}</Text>
    </View>
  );
}
