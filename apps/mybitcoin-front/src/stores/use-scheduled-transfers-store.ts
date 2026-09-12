import { create } from 'zustand'
import type { ScheduledTransfer } from '@/types/backoffice'

// Dados mocados — protótipo visual, sem chamada de API real (ver skill brief).
const MOCK_TRANSFERS: ScheduledTransfer[] = [
  {
    id: 'transfer_1',
    asset: 'BTC',
    origem: 'cold',
    destino: 'hot',
    valor: '50000000',
    agendadoPara: '2026-09-12T09:00:00',
    status: 'agendada',
  },
  {
    id: 'transfer_2',
    asset: 'ETH',
    origem: 'cold',
    destino: 'hot',
    valor: '20000000',
    agendadoPara: '2026-09-11T14:30:00',
    status: 'processando',
  },
  {
    id: 'transfer_3',
    asset: 'USDT',
    origem: 'cold',
    destino: 'hot',
    valor: '100000000',
    agendadoPara: '2026-09-10T08:00:00',
    status: 'concluida',
  },
  {
    id: 'transfer_4',
    asset: 'BTC',
    origem: 'hot',
    destino: 'cold',
    valor: '15000000',
    agendadoPara: '2026-09-09T18:00:00',
    status: 'concluida',
  },
  {
    id: 'transfer_5',
    asset: 'SOL',
    origem: 'cold',
    destino: 'hot',
    valor: '5000000',
    agendadoPara: '2026-09-13T11:00:00',
    status: 'agendada',
  },
  {
    id: 'transfer_6',
    asset: 'ETH',
    origem: 'cold',
    destino: 'hot',
    valor: '8000000',
    agendadoPara: '2026-09-08T10:00:00',
    status: 'cancelada',
  },
]

interface ScheduledTransfersState {
  transfers: ScheduledTransfer[]
  create: (transfer: Omit<ScheduledTransfer, 'id' | 'status'>) => void
  cancel: (id: string) => void
}

/**
 * Estado cross-page das transferências agendadas cold↔hot do backoffice —
 * tanto a tela de Carteiras (atalho "Transferir" por reserva) quanto a de
 * Transferências criam/cancelam itens desta mesma lista, por isso vive em
 * Zustand em vez de `useState` local duplicado em cada página. Mock de UI,
 * sem persistência real entre reloads (ver `apps/mybitcoin-front/CLAUDE.md`).
 */
export const useScheduledTransfersStore = create<ScheduledTransfersState>()((set) => ({
  transfers: MOCK_TRANSFERS,
  create: (transfer) =>
    set((state) => ({
      transfers: [
        { ...transfer, id: `transfer_${Date.now()}`, status: 'agendada' },
        ...state.transfers,
      ],
    })),
  cancel: (id) =>
    set((state) => ({
      transfers: state.transfers.map((transfer) =>
        transfer.id === id ? { ...transfer, status: 'cancelada' as const } : transfer,
      ),
    })),
}))
