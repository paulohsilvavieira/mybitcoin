import { cn } from '@/lib/utils'
import type { MarketStats } from '@/types/trading'

function formatBrl(value: string): string {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

interface StatProps {
  label: string
  value: string
  tone?: 'success' | 'destructive'
}

function Stat({ label, value, tone }: StatProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-mono text-sm tabular-nums',
          tone === 'success' && 'text-success',
          tone === 'destructive' && 'text-destructive',
        )}
      >
        {value}
      </span>
    </div>
  )
}

interface MarketTickerProps {
  stats: MarketStats
}

export function MarketTicker({ stats }: MarketTickerProps) {
  const isPositive = stats.changePercent24h >= 0

  return (
    <div className="flex flex-wrap items-center gap-x-12 gap-y-4 rounded-xl border border-border bg-card px-6 py-5 sm:px-8">
      <div>
        <p className="font-heading font-semibold">{stats.pair}</p>
        <p className="font-mono text-2xl font-medium tabular-nums">
          R$ {formatBrl(stats.lastPrice)}
        </p>
      </div>

      <Stat
        label="Variação 24h"
        value={`${isPositive ? '+' : ''}${stats.changePercent24h.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`}
        tone={isPositive ? 'success' : 'destructive'}
      />
      <Stat label="Máxima 24h" value={`R$ ${formatBrl(stats.high24h)}`} />
      <Stat label="Mínima 24h" value={`R$ ${formatBrl(stats.low24h)}`} />
      <Stat label="Volume 24h (BTC)" value={stats.volume24h} />
    </div>
  )
}
