import { Badge, type BadgeVariant } from '@/components/ui/badge'
import type { KycReviewEntry } from '@/types/backoffice'

const DECISAO_VARIANT: Record<KycReviewEntry['decisao'], BadgeVariant> = {
  enviado: 'outline',
  aprovado: 'success',
  rejeitado: 'destructive',
  reenviado: 'default',
}

const DECISAO_LABEL: Record<KycReviewEntry['decisao'], string> = {
  enviado: 'Enviado',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  reenviado: 'Reenviado',
}

export interface KycReviewTimelineProps {
  historico: KycReviewEntry[]
}

/** Linha do tempo simples com os eventos de revisão de KYC de um usuário. */
export function KycReviewTimeline({ historico }: KycReviewTimelineProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">Histórico de revisão</span>

      {historico.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem eventos registrados.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {historico.map((entry, index) => (
            <li
              key={`${entry.data}-${index}`}
              className="flex flex-col gap-1 border-l-2 border-border pl-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={DECISAO_VARIANT[entry.decisao]}>
                  {DECISAO_LABEL[entry.decisao]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.data).toLocaleString('pt-BR')}
                </span>
              </div>
              <span className="text-sm text-foreground">{entry.adminNome}</span>
              {entry.motivo && (
                <span className="text-sm text-muted-foreground">{entry.motivo}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
