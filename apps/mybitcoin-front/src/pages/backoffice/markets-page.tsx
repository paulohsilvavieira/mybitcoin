import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { AdminMarketTable } from '@/components/backoffice/admin-market-table'
import { CreateMarketDialog } from '@/components/backoffice/create-market-dialog'
import { MOCK_MARKETS } from '@/pages/backoffice/markets-page.mocks'
import type { AdminMarket } from '@/types/backoffice-markets'

const NEXT_STATUS = { ATIVO: 'PAUSADO', PAUSADO: 'ATIVO' } as const

/** Página de gestão de mercados/pares de negociação do backoffice (mock de UI, sem endpoint real). */
export function MarketsPage() {
  const [markets, setMarkets] = useState<AdminMarket[]>(MOCK_MARKETS)
  const [createOpen, setCreateOpen] = useState(false)
  const { toast } = useToast()

  function handleToggleStatus(market: AdminMarket) {
    if (market.status === 'DESLISTADO') return
    const nextStatus = NEXT_STATUS[market.status]
    setMarkets((prev) =>
      prev.map((item) => (item.id === market.id ? { ...item, status: nextStatus } : item)),
    )
    toast({
      title:
        nextStatus === 'PAUSADO'
          ? `Mercado ${market.symbol} pausado (simulação)`
          : `Mercado ${market.symbol} reativado (simulação)`,
      variant: 'success',
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold">Mercados</h1>
          <p className="text-sm text-muted-foreground">
            Pares de negociação disponíveis na plataforma — quantidade mínima, incremento, tick
            size e status.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          Novo mercado
        </Button>
      </div>

      <AdminMarketTable markets={markets} onToggleStatus={handleToggleStatus} />

      <CreateMarketDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(market) => setMarkets((prev) => [...prev, market])}
      />
    </div>
  )
}
