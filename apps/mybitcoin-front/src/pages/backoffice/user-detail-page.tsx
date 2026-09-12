import { useState } from 'react'
import { AccountLevelCard } from '@/components/backoffice/account-level-card'
import { BlockUserDialog } from '@/components/backoffice/block-user-dialog'
import { KycDetailCard } from '@/components/backoffice/kyc-detail-card'
import { RefundDialog } from '@/components/backoffice/refund-dialog'
import { UserActivityList } from '@/components/backoffice/user-activity-list'
import { UserDetailHeader } from '@/components/backoffice/user-detail-header'
import { UserFeeTab } from '@/components/backoffice/user-fee-tab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BalanceRows } from '@/components/wallet/balance-list'
import { TransactionHistory } from '@/components/wallet/transaction-history'
import { MOCK_FEE_OVERRIDES } from '@/pages/backoffice/fees-page.mocks'
import type { Balance, Transaction } from '@/types/wallet'
import type { AdminUser } from '@/types/backoffice'
import type { UserFeeOverride } from '@/types/backoffice-fees'

// Rota `/preview/backoffice/users/:id` ignora o param e sempre mostra este
// usuário mocado (ver skill brief) — protótipo visual, sem lookup real.
const MOCK_USER: AdminUser = {
  id: 'usr_1',
  nome: 'Ana Beatriz Souza',
  email: 'ana.souza@example.com',
  status: 'ACTIVE',
  kycStatus: 'VERIFIED',
  kyc: {
    nomeCompleto: 'Ana Beatriz Souza',
    cpf: '123.456.789-45',
    dataNascimento: '1994-03-22',
    nacionalidade: 'Brasileira',
    enviadoEm: '2024-02-12T09:00:00Z',
    tipoDocumento: 'RG',
    numeroDocumento: '12.345.678-9',
    endereco: 'Rua das Flores, 123, São Paulo, SP',
    telefone: '(11) 98765-4321',
    riscoFraude: 'baixo',
    notasInternas: [],
    historico: [
      { data: '2024-02-12T09:00:00Z', adminNome: 'Sistema', decisao: 'enviado' },
      { data: '2024-02-14T10:00:00Z', adminNome: 'Marina Alves', decisao: 'aprovado' },
    ],
  },
  accountLevel: 'intermediario',
  saldoTotalSatoshi: '15000000',
  dataCadastro: '2024-02-11',
}

const MOCK_BALANCES: Balance[] = [
  { asset: 'BTC', available: '15000000', locked: '0', total: '15000000' },
]

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    type: 'DEPOSIT',
    asset: 'BTC',
    amountSatoshi: '10000000',
    status: 'CONFIRMED',
    txHash: '3b1e7a9c4f2d8e6b0a1c9d7e5f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a',
    createdAt: '2026-08-14T10:30:00Z',
  },
  {
    id: 'tx_2',
    type: 'WITHDRAWAL',
    asset: 'BTC',
    amountSatoshi: '5000000',
    status: 'PENDING',
    txHash: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
    createdAt: '2026-09-01T15:12:00Z',
  },
]

/** Página de detalhes do usuário no backoffice (mock de UI, id fixo). */
export function UserDetailPage() {
  const [blockOpen, setBlockOpen] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)
  const [feeOverrides, setFeeOverrides] = useState<UserFeeOverride[]>(MOCK_FEE_OVERRIDES)

  return (
    <div className="flex flex-col gap-6">
      <UserDetailHeader
        user={MOCK_USER}
        onBlockClick={() => setBlockOpen(true)}
        onRefundClick={() => setRefundOpen(true)}
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="fees">Taxas</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 flex flex-col gap-4">
          <BalanceRows balances={MOCK_BALANCES} />
          <AccountLevelCard userName={MOCK_USER.nome} accountLevel={MOCK_USER.accountLevel} />
        </TabsContent>

        <TabsContent value="kyc" className="mt-4">
          <KycDetailCard
            userName={MOCK_USER.nome}
            kycStatus={MOCK_USER.kycStatus}
            kyc={MOCK_USER.kyc}
          />
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <div className="rounded-xl border border-border bg-card">
            <TransactionHistory transactions={MOCK_TRANSACTIONS} />
          </div>
        </TabsContent>

        <TabsContent value="fees" className="mt-4">
          <UserFeeTab
            userId={MOCK_USER.id}
            userNome={MOCK_USER.nome}
            overrides={feeOverrides}
            onCreate={(override) => setFeeOverrides((prev) => [...prev, override])}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <UserActivityList />
        </TabsContent>
      </Tabs>

      <BlockUserDialog open={blockOpen} onOpenChange={setBlockOpen} userName={MOCK_USER.nome} />
      <RefundDialog open={refundOpen} onOpenChange={setRefundOpen} userName={MOCK_USER.nome} />
    </div>
  )
}
