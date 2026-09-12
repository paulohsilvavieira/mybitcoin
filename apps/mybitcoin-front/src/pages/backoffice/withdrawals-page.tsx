import { useState } from 'react'
import { WithdrawalQueueTable } from '@/components/backoffice/withdrawal-queue-table'
import { WithdrawalDetailDialog } from '@/components/backoffice/withdrawal-detail-dialog'
import {
  WithdrawalReviewDialog,
  type ReviewAction,
} from '@/components/backoffice/withdrawal-review-dialog'
import type { WithdrawalRequest } from '@/types/backoffice'

// Dados mocados — protótipo visual, sem chamada de API real (ver skill brief).
// Exatamente 7 registros com status PENDING_APPROVAL, para bater com o
// StatCard "Saques pendentes" do dashboard.
const MOCK_WITHDRAWALS: WithdrawalRequest[] = [
  { id: 'wd_1', userId: 'u_1', userNome: 'Ana Beatriz Souza', asset: 'BTC', valor: '25000000', feeSatoshi: '20000', enderecoDestino: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', status: 'PENDING_APPROVAL', criadoEm: '2026-09-11T09:15:00Z', nivelUsuario: 'intermediario' },
  { id: 'wd_2', userId: 'u_2', userNome: 'Carlos Eduardo Lima', asset: 'ETH', valor: '150000000', feeSatoshi: '300000', enderecoDestino: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1', status: 'PENDING_APPROVAL', criadoEm: '2026-09-11T08:40:00Z', nivelUsuario: 'basico' },
  { id: 'wd_3', userId: 'u_3', userNome: 'Fernanda Rocha', asset: 'BTC', valor: '180000000', feeSatoshi: '20000', enderecoDestino: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', status: 'PENDING_APPROVAL', criadoEm: '2026-09-11T07:55:00Z', nivelUsuario: 'avancado' },
  { id: 'wd_4', userId: 'u_4', userNome: 'Gustavo Almeida', asset: 'USDT', valor: '800000000', feeSatoshi: '1000000', enderecoDestino: 'TXYZopqrstuvwxyzabcdefghijklm123456789A', status: 'PENDING_APPROVAL', criadoEm: '2026-09-11T07:20:00Z', nivelUsuario: 'intermediario' },
  { id: 'wd_5', userId: 'u_5', userNome: 'Juliana Martins', asset: 'SOL', valor: '5000000000', feeSatoshi: '10000000', enderecoDestino: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM6', status: 'PENDING_APPROVAL', criadoEm: '2026-09-11T06:50:00Z', nivelUsuario: 'basico' },
  { id: 'wd_6', userId: 'u_6', userNome: 'Marcelo Tavares', asset: 'BTC', valor: '3000000', feeSatoshi: '20000', enderecoDestino: 'bc1q9d4ywgfnud40s0kkzfx8clsjvsl0rrsngjkfg2', status: 'PENDING_APPROVAL', criadoEm: '2026-09-11T06:10:00Z', nivelUsuario: 'basico' },
  { id: 'wd_7', userId: 'u_7', userNome: 'Patrícia Nogueira', asset: 'ETH', valor: '40000000', feeSatoshi: '300000', enderecoDestino: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', status: 'PENDING_APPROVAL', criadoEm: '2026-09-11T05:30:00Z', nivelUsuario: 'intermediario' },
  { id: 'wd_8', userId: 'u_8', userNome: 'Rafael Cardoso', asset: 'BTC', valor: '12000000', feeSatoshi: '20000', enderecoDestino: 'bc1qmpwzkkq2yh8ecwdrcqf5r6r6z8v8t3xu5jf0jw', status: 'CREATED', criadoEm: '2026-09-11T10:05:00Z', nivelUsuario: 'basico' },
  { id: 'wd_9', userId: 'u_9', userNome: 'Simone Ferreira', asset: 'USDT', valor: '250000000', feeSatoshi: '1000000', enderecoDestino: 'TAbcdEfghIjklMnopQrstUvwxyZ1234567890B', status: 'PENDING_VALIDATION', criadoEm: '2026-09-11T09:45:00Z', nivelUsuario: 'intermediario' },
  { id: 'wd_10', userId: 'u_10', userNome: 'Thiago Barbosa', asset: 'BTC', valor: '50000000', feeSatoshi: '20000', enderecoDestino: 'bc1qsvvhg93y6nsw2c4t8fce3p5wpsyfyq3mzq5f7f', status: 'COMPLETED', criadoEm: '2026-09-10T18:20:00Z', nivelUsuario: 'avancado', revisadoPor: 'Paulo Henrique', revisadoEm: '2026-09-10T18:22:00Z' },
  { id: 'wd_11', userId: 'u_11', userNome: 'Vanessa Pires', asset: 'SOL', valor: '900000000', feeSatoshi: '10000000', enderecoDestino: '7dHbZbUsFqzYUJnEyF9GGRLbCoVWXWTBnJprwPXAyGCT', status: 'REJECTED', criadoEm: '2026-09-10T15:00:00Z', nivelUsuario: 'basico', revisadoPor: 'Marina Costa', revisadoEm: '2026-09-10T15:10:00Z', motivoRevisao: 'Endereço de destino sinalizado em lista de risco.' },
  { id: 'wd_12', userId: 'u_12', userNome: 'William Duarte', asset: 'ETH', valor: '25000000', feeSatoshi: '300000', enderecoDestino: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7', status: 'PROCESSING', criadoEm: '2026-09-11T04:10:00Z', nivelUsuario: 'intermediario', revisadoPor: 'Rafael Nunes', revisadoEm: '2026-09-11T04:15:00Z' },
]

interface ReviewState {
  withdrawal: WithdrawalRequest
  action: ReviewAction
}

/** Fila de aprovação de saques do backoffice (mock de UI, sem endpoint real). */
export function WithdrawalsPage() {
  const [reviewState, setReviewState] = useState<ReviewState | null>(null)
  const [detailWithdrawal, setDetailWithdrawal] = useState<WithdrawalRequest | null>(null)

  function handleReview(withdrawal: WithdrawalRequest, action: ReviewAction) {
    setReviewState({ withdrawal, action })
  }

  function handleConfirm() {
    // Mock de UI: nenhuma mutação real de estado é persistida (ver skill brief).
    setReviewState(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Fila de aprovação de saques</h1>
        <p className="text-sm text-muted-foreground">
          Solicitações de saque aguardando revisão manual conforme a política de aprovação.
        </p>
      </div>

      <WithdrawalQueueTable
        withdrawals={MOCK_WITHDRAWALS}
        onReview={handleReview}
        onViewDetails={setDetailWithdrawal}
      />

      <WithdrawalReviewDialog
        open={reviewState !== null}
        onOpenChange={(open) => !open && setReviewState(null)}
        withdrawal={reviewState?.withdrawal ?? null}
        action={reviewState?.action ?? null}
        onConfirm={handleConfirm}
      />

      <WithdrawalDetailDialog
        withdrawal={detailWithdrawal}
        onOpenChange={(open) => !open && setDetailWithdrawal(null)}
      />
    </div>
  )
}
