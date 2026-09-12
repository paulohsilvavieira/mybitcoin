import { Landmark } from 'lucide-react'
import { useState } from 'react'
import { StatCard } from '@/components/backoffice/stat-card'
import { WalletReserveCard } from '@/components/backoffice/wallet-reserve-card'
import { CreateTransferDialog } from '@/components/backoffice/create-transfer-dialog'
import { formatSatoshi } from '@/lib/utils'
import { useScheduledTransfersStore } from '@/stores/use-scheduled-transfers-store'
import type { WalletMovement, WalletReserve } from '@/types/backoffice'

// Dados mocados — protótipo visual, sem chamada de API real (ver skill brief).
// Saldos de ETH/USDT/SOL usam a mesma unidade satoshi-like (menor unidade,
// serializada como string) só para efeito de exibição no protótipo.
const MOCK_RESERVES: WalletReserve[] = [
  {
    asset: 'BTC',
    hotBalance: '320000000',
    coldBalance: '4500000000',
    hotMinThreshold: '200000000',
    isHealthy: true,
    addresses: {
      hot: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      cold: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    },
  },
  {
    asset: 'ETH',
    hotBalance: '45000000',
    coldBalance: '980000000',
    hotMinThreshold: '60000000',
    isHealthy: false,
    addresses: {
      hot: '0x71C7656EC7ab88b098defB751B7401B5f6d8976',
      cold: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    },
  },
  {
    asset: 'USDT',
    hotBalance: '150000000',
    coldBalance: '600000000',
    hotMinThreshold: '100000000',
    isHealthy: true,
    addresses: {
      hot: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
      cold: 'TXYZbFWBjkbCV5wcJyN9YS1JQFvJhJ6Wjb',
    },
  },
  {
    asset: 'SOL',
    hotBalance: '18000000',
    coldBalance: '210000000',
    hotMinThreshold: '20000000',
    isHealthy: false,
    addresses: {
      hot: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      cold: '5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2kkka',
    },
  },
]

const MOCK_MOVEMENTS: Record<string, WalletMovement[]> = {
  BTC: [
    { id: 'mv_btc_1', asset: 'BTC', tipo: 'debito', valor: '5000000', motivo: 'Saque de usuário', data: '2026-09-11T08:30:00' },
    { id: 'mv_btc_2', asset: 'BTC', tipo: 'credito', valor: '12000000', motivo: 'Depósito de usuário', data: '2026-09-10T19:10:00' },
    { id: 'mv_btc_3', asset: 'BTC', tipo: 'debito', valor: '15000000', motivo: 'Rebalanceamento hot → cold', data: '2026-09-09T18:00:00' },
    { id: 'mv_btc_4', asset: 'BTC', tipo: 'credito', valor: '3000000', motivo: 'Depósito de usuário', data: '2026-09-08T09:45:00' },
  ],
  ETH: [
    { id: 'mv_eth_1', asset: 'ETH', tipo: 'debito', valor: '2000000', motivo: 'Saque de usuário', data: '2026-09-11T11:00:00' },
    { id: 'mv_eth_2', asset: 'ETH', tipo: 'debito', valor: '4000000', motivo: 'Saque de usuário', data: '2026-09-10T16:20:00' },
    { id: 'mv_eth_3', asset: 'ETH', tipo: 'credito', valor: '20000000', motivo: 'Transferência cold → hot', data: '2026-09-11T14:30:00' },
    { id: 'mv_eth_4', asset: 'ETH', tipo: 'credito', valor: '1500000', motivo: 'Depósito de usuário', data: '2026-09-07T10:05:00' },
  ],
  USDT: [
    { id: 'mv_usdt_1', asset: 'USDT', tipo: 'credito', valor: '100000000', motivo: 'Transferência cold → hot', data: '2026-09-10T08:00:00' },
    { id: 'mv_usdt_2', asset: 'USDT', tipo: 'debito', valor: '25000000', motivo: 'Saque de usuário', data: '2026-09-09T13:40:00' },
    { id: 'mv_usdt_3', asset: 'USDT', tipo: 'credito', valor: '5000000', motivo: 'Depósito de usuário', data: '2026-09-08T17:15:00' },
    { id: 'mv_usdt_4', asset: 'USDT', tipo: 'debito', valor: '10000000', motivo: 'Saque de usuário', data: '2026-09-06T12:00:00' },
  ],
  SOL: [
    { id: 'mv_sol_1', asset: 'SOL', tipo: 'debito', valor: '1000000', motivo: 'Saque de usuário', data: '2026-09-11T09:00:00' },
    { id: 'mv_sol_2', asset: 'SOL', tipo: 'debito', valor: '500000', motivo: 'Saque de usuário', data: '2026-09-10T20:30:00' },
    { id: 'mv_sol_3', asset: 'SOL', tipo: 'credito', valor: '5000000', motivo: 'Transferência cold → hot', data: '2026-09-13T11:00:00' },
    { id: 'mv_sol_4', asset: 'SOL', tipo: 'credito', valor: '800000', motivo: 'Depósito de usuário', data: '2026-09-05T15:20:00' },
  ],
}

// Soma só o BTC: ativos diferentes têm escalas/decimais distintos, somar os
// satoshi "brutos" de ETH/USDT/SOL junto do BTC produziria um total inválido.
const TOTAL_CUSTODIA_BTC_SATOSHI = MOCK_RESERVES.filter((reserve) => reserve.asset === 'BTC')
  .reduce((acc, reserve) => acc + BigInt(reserve.hotBalance) + BigInt(reserve.coldBalance), 0n)
  .toString()

/** Página de carteiras hot/cold do backoffice (mock de UI). */
export function WalletsPage() {
  const [transferReserve, setTransferReserve] = useState<WalletReserve | null>(null)
  const createTransfer = useScheduledTransfersStore((state) => state.create)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Carteiras</h1>
        <p className="text-sm text-muted-foreground">
          Reservas hot e cold por ativo, com saúde de saldo operacional.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total em custódia (BTC)"
          value={formatSatoshi(TOTAL_CUSTODIA_BTC_SATOSHI)}
          icon={Landmark}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MOCK_RESERVES.map((reserve) => (
          <WalletReserveCard
            key={reserve.asset}
            reserve={reserve}
            movements={MOCK_MOVEMENTS[reserve.asset] ?? []}
            onTransferClick={() => setTransferReserve(reserve)}
          />
        ))}
      </div>

      {transferReserve && (
        <CreateTransferDialog
          open={!!transferReserve}
          onOpenChange={(open) => !open && setTransferReserve(null)}
          onCreate={createTransfer}
          initialAsset={transferReserve.asset}
          // Reserva hot abaixo do mínimo → sugere reabastecer a partir da
          // cold; se já está saudável, mantém o padrão (também cold → hot).
          initialOrigem="cold"
          initialDestino="hot"
        />
      )}
    </div>
  )
}
