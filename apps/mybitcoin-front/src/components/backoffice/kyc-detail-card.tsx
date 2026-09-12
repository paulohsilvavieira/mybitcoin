import { useState } from 'react'
import { KycBadge } from '@/components/auth/kyc-badge'
import { KycDocumentInfo } from '@/components/backoffice/kyc-document-info'
import { KycNotes } from '@/components/backoffice/kyc-notes'
import { KycReviewDialog, type KycReviewAction } from '@/components/backoffice/kyc-review-dialog'
import { KycReviewTimeline } from '@/components/backoffice/kyc-review-timeline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AdminUserKyc } from '@/types/backoffice'
import type { KycStatus } from '@/types/auth'

export interface KycDetailCardProps {
  userName: string
  kycStatus: KycStatus
  kyc?: AdminUserKyc
}

/** Card de dados de KYC do usuário no backoffice — CPF e documento mascarados (dados sensíveis). */
export function KycDetailCard({ userName, kycStatus, kyc }: KycDetailCardProps) {
  const [reviewAction, setReviewAction] = useState<KycReviewAction | null>(null)
  const [historico, setHistorico] = useState(kyc?.historico ?? [])

  function handleConfirm(reason?: string) {
    if (!reviewAction) return
    setHistorico((prev) => [
      ...prev,
      {
        data: new Date().toISOString(),
        adminNome: 'Admin logado (simulação)',
        decisao: reviewAction === 'approve' ? 'aprovado' : 'rejeitado',
        motivo: reason,
      },
    ])
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Verificação KYC</CardTitle>
        <KycBadge status={kycStatus} />
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {!kyc ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum documento enviado ainda.
          </p>
        ) : (
          <>
            <KycDocumentInfo kyc={kyc} />

            <KycNotes notasIniciais={kyc.notasInternas} />

            <KycReviewTimeline historico={historico} />

            {kycStatus === 'PENDING' && (
              <div className="flex gap-2">
                <Button onClick={() => setReviewAction('approve')}>Aprovar KYC</Button>
                <Button variant="destructive" onClick={() => setReviewAction('reject')}>
                  Rejeitar KYC
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>

      {reviewAction && (
        <KycReviewDialog
          open
          onOpenChange={(open) => !open && setReviewAction(null)}
          action={reviewAction}
          userName={userName}
          onConfirm={handleConfirm}
        />
      )}
    </Card>
  )
}
