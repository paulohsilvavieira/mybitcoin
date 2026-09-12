import { AssetIcon, assetLabel } from '@/components/wallet/asset-icon'
import { cn, formatSatoshi } from '@/lib/utils'
import type { MarketAsset } from '@/types/market'

interface SparklineProps {
  points: number[]
  isPositive: boolean
}

const SPARKLINE_WIDTH = 100
const SPARKLINE_HEIGHT = 32

/** Mini-gráfico de tendência em SVG puro — sem lib de gráfico, só a linha,
 * sem eixos. */
function Sparkline({ points, isPositive }: SparklineProps) {
  if (points.length < 2) return null

  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1

  const coordinates = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * SPARKLINE_WIDTH
      const y = SPARKLINE_HEIGHT - ((value - min) / range) * SPARKLINE_HEIGHT
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
      aria-hidden="true"
      className="h-8 w-full"
      preserveAspectRatio="none"
    >
      <polyline
        points={coordinates}
        fill="none"
        strokeWidth={2}
        className={isPositive ? 'stroke-success' : 'stroke-destructive'}
      />
    </svg>
  )
}

export interface CoinCardProps {
  data: MarketAsset
}

/** Card compacto de uma moeda, com mini-sparkline de tendência. */
export function CoinCard({ data }: CoinCardProps) {
  const isPositive = data.changePercent24h >= 0

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <AssetIcon asset={data.asset} className="size-8 text-sm" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{data.asset}</p>
          <p className="truncate text-xs text-muted-foreground">{assetLabel(data.asset)}</p>
        </div>
      </div>

      <Sparkline points={data.sparkline} isPositive={isPositive} />

      <div className="flex items-end justify-between gap-2">
        <p className="font-mono text-sm font-medium tabular-nums">
          {formatSatoshi(data.priceSatoshi, 'btc', data.asset)}
        </p>
        <p
          className={cn(
            'font-mono text-xs tabular-nums',
            isPositive ? 'text-success' : 'text-destructive',
          )}
        >
          {isPositive ? '+' : ''}
          {data.changePercent24h.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
        </p>
      </div>
    </div>
  )
}
