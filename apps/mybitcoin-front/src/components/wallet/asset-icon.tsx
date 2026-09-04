import { cn } from '@/lib/utils'

interface AssetMeta {
  label: string
  color: string
  glyph: string
}

/**
 * Cor e símbolo reconhecíveis do próprio ativo (padrão Binance/Coinbase de
 * selo por moeda) — não é a cor de marca do produto, por isso vive fora dos
 * tokens de `index.css`. Ativo sem selo dedicado cai no fallback de iniciais.
 */
const ASSET_META: Record<string, AssetMeta> = {
  BTC: { label: 'Bitcoin', color: '#F7931A', glyph: '₿' },
}

export function assetLabel(asset: string): string {
  return ASSET_META[asset]?.label ?? asset
}

interface AssetIconProps {
  asset: string
  className?: string
}

export function AssetIcon({ asset, className }: AssetIconProps) {
  const meta = ASSET_META[asset]

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-heading font-bold text-white',
        className,
      )}
      style={{ backgroundColor: meta?.color ?? 'var(--muted-foreground)' }}
    >
      {meta?.glyph ?? asset.slice(0, 1)}
    </span>
  )
}
