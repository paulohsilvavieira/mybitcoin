import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AdminMarket, MarketStatus } from '@/types/backoffice-markets'

const STATUS_BADGE_VARIANT: Record<MarketStatus, BadgeVariant> = {
  ATIVO: 'success',
  PAUSADO: 'outline',
  DESLISTADO: 'destructive',
}

const STATUS_LABEL: Record<MarketStatus, string> = {
  ATIVO: 'Ativo',
  PAUSADO: 'Pausado',
  DESLISTADO: 'Deslistado',
}

interface AdminMarketTableProps {
  markets: AdminMarket[]
  onToggleStatus: (market: AdminMarket) => void
}

/** Tabela de mercados/pares de negociação administrados pelo backoffice. */
export function AdminMarketTable({ markets, onToggleStatus }: AdminMarketTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Símbolo</TableHead>
            <TableHead>Quantidade mínima</TableHead>
            <TableHead>Incremento</TableHead>
            <TableHead>Tick size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {markets.map((market) => (
            <TableRow key={market.id}>
              <TableCell className="font-medium">{market.symbol}</TableCell>
              <TableCell className="tabular-nums">
                {market.minQuantity} {market.baseAsset}
              </TableCell>
              <TableCell className="tabular-nums">
                {market.quantityIncrement} {market.baseAsset}
              </TableCell>
              <TableCell className="tabular-nums">
                {market.tickSize} {market.quoteAsset}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE_VARIANT[market.status]}>
                  {STATUS_LABEL[market.status]}
                </Badge>
              </TableCell>
              <TableCell>
                {market.status !== 'DESLISTADO' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus(market)}
                  >
                    {market.status === 'ATIVO' ? 'Pausar' : 'Reativar'}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {markets.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum mercado cadastrado.
        </p>
      )}
    </div>
  )
}
