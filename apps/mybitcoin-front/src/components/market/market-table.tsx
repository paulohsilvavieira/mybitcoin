import { useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { AssetIcon, assetLabel } from '@/components/wallet/asset-icon'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn, formatSatoshi } from '@/lib/utils'
import type { MarketAsset } from '@/types/market'

type SortKey = 'priceSatoshi' | 'changePercent24h' | 'volume24h'

interface SortState {
  key: SortKey
  direction: 'asc' | 'desc'
}

function compare(a: MarketAsset, b: MarketAsset, key: SortKey): number {
  if (key === 'changePercent24h') {
    return a.changePercent24h - b.changePercent24h
  }
  // priceSatoshi/volume24h chegam como string — comparar via BigInt evita
  // perda de precisão (FIN-001), sem converter para number.
  return BigInt(a[key]) < BigInt(b[key]) ? -1 : BigInt(a[key]) > BigInt(b[key]) ? 1 : 0
}

interface SortableHeadProps {
  label: string
  sortKey: SortKey
  sort: SortState | null
  onSort: (key: SortKey) => void
}

function SortableHead({ label, sortKey, sort, onSort }: SortableHeadProps) {
  const isActive = sort?.key === sortKey

  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="flex h-11 items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        {label}
        {isActive &&
          (sort?.direction === 'asc' ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          ))}
      </button>
    </TableHead>
  )
}

export interface MarketTableProps {
  assets: MarketAsset[]
}

/** Tabela de mercado — ordenável por coluna (client-side). Sem endpoint real
 * na API ainda; dados chegam via props (mock/preview). */
export function MarketTable({ assets }: MarketTableProps) {
  const [sort, setSort] = useState<SortState | null>(null)

  function handleSort(key: SortKey) {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'desc' }
      return { key, direction: current.direction === 'desc' ? 'asc' : 'desc' }
    })
  }

  const sorted = sort
    ? [...assets].sort((a, b) => {
        const result = compare(a, b, sort.key)
        return sort.direction === 'asc' ? result : -result
      })
    : assets

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-8 text-center">
        <p className="font-medium">Nenhum ativo disponível</p>
        <p className="text-sm text-muted-foreground">Os mercados aparecem aqui quando disponíveis.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">Ativo</TableHead>
          <SortableHead label="Preço" sortKey="priceSatoshi" sort={sort} onSort={handleSort} />
          <SortableHead label="Variação 24h" sortKey="changePercent24h" sort={sort} onSort={handleSort} />
          <SortableHead label="Volume 24h" sortKey="volume24h" sort={sort} onSort={handleSort} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((row) => {
          const isPositive = row.changePercent24h >= 0
          return (
            <TableRow key={row.asset}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <AssetIcon asset={row.asset} className="size-8 text-sm" />
                  <div className="min-w-0">
                    <p className="font-medium">{row.asset}</p>
                    <p className="text-xs text-muted-foreground">{assetLabel(row.asset)}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono tabular-nums">
                {formatSatoshi(row.priceSatoshi, 'btc', row.asset)}
              </TableCell>
              <TableCell
                className={cn('font-mono tabular-nums', isPositive ? 'text-success' : 'text-destructive')}
              >
                {isPositive ? '+' : ''}
                {row.changePercent24h.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
              </TableCell>
              <TableCell className="font-mono tabular-nums text-muted-foreground">
                {formatSatoshi(row.volume24h, 'btc', row.asset)}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
