import { AuditLogTable } from '@/components/backoffice/audit-log-table'
import type { AuditLogEntry } from '@/types/backoffice'

// Dados mocados — protótipo visual, sem chamada de API real (ver skill brief).
// Inclui os mesmos tipos de ação disparados pelos dialogs de bloqueio/estorno
// da página de detalhe do usuário, para dar sensação de sistema coerente.
const MOCK_ENTRIES: AuditLogEntry[] = [
  {
    id: 'audit_1',
    dataHora: '2026-09-11T09:15:00',
    adminNome: 'Paulo Henrique',
    actionType: 'bloqueio_usuario',
    acao: 'Bloqueou usuário',
    alvo: 'Carlos Eduardo Lima',
    detalhes: 'Suspeita de fraude reportada pelo time de risco.',
  },
  {
    id: 'audit_2',
    dataHora: '2026-09-11T08:40:00',
    adminNome: 'Marina Costa',
    actionType: 'estorno',
    acao: 'Estornou valor',
    alvo: 'Ana Beatriz Souza',
    detalhes: 'Estorno de 0.001 BTC referente a taxa cobrada em duplicidade.',
  },
  {
    id: 'audit_3',
    dataHora: '2026-09-10T18:20:00',
    adminNome: 'Paulo Henrique',
    actionType: 'transferencia_agendada',
    acao: 'Agendou transferência cold→hot',
    alvo: 'transfer_1 (BTC)',
    detalhes: 'Reposição de saldo hot para cobrir saques previstos.',
  },
  {
    id: 'audit_4',
    dataHora: '2026-09-10T16:05:00',
    adminNome: 'Rafael Nunes',
    actionType: 'transferencia_cancelada',
    acao: 'Cancelou transferência',
    alvo: 'transfer_6 (ETH)',
    detalhes: 'Cancelada por divergência no valor solicitado.',
  },
  {
    id: 'audit_5',
    dataHora: '2026-09-10T11:30:00',
    adminNome: 'Marina Costa',
    actionType: 'bloqueio_usuario',
    acao: 'Bloqueou usuário',
    alvo: 'Helena Martins',
    detalhes: 'Tentativas de login suspeitas de múltiplos IPs.',
  },
  {
    id: 'audit_6',
    dataHora: '2026-09-09T14:50:00',
    adminNome: 'Paulo Henrique',
    actionType: 'estorno',
    acao: 'Estornou valor',
    alvo: 'Gustavo Pires',
    detalhes: 'Estorno de depósito não creditado por falha de conciliação.',
  },
  {
    id: 'audit_7',
    dataHora: '2026-09-09T09:00:00',
    adminNome: 'Rafael Nunes',
    actionType: 'transferencia_agendada',
    acao: 'Agendou transferência cold→hot',
    alvo: 'transfer_5 (SOL)',
    detalhes: 'Reposição preventiva de saldo hot.',
  },
  {
    id: 'audit_8',
    dataHora: '2026-09-08T17:10:00',
    adminNome: 'Marina Costa',
    actionType: 'outro',
    acao: 'Alterou limite de saque diário',
    alvo: 'Configuração global',
    detalhes: 'Limite ajustado de 0.5 BTC para 0.8 BTC.',
  },
  {
    id: 'audit_9',
    dataHora: '2026-09-08T10:25:00',
    adminNome: 'Paulo Henrique',
    actionType: 'bloqueio_usuario',
    acao: 'Desbloqueou usuário',
    alvo: 'Lucas Andrade',
    detalhes: 'Revisão manual concluiu que não houve fraude.',
  },
  {
    id: 'audit_10',
    dataHora: '2026-09-07T15:45:00',
    adminNome: 'Rafael Nunes',
    actionType: 'transferencia_cancelada',
    acao: 'Cancelou transferência',
    alvo: 'transfer_4 (BTC)',
    detalhes: 'Cancelada a pedido do time de tesouraria.',
  },
]

/** Página de auditoria de ações administrativas do backoffice (mock de UI). */
export function AuditPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Auditoria</h1>
        <p className="text-sm text-muted-foreground">
          Histórico de ações administrativas realizadas na operação.
        </p>
      </div>

      <AuditLogTable entries={MOCK_ENTRIES} />
    </div>
  )
}
