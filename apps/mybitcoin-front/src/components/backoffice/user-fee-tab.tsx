import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CreateFeeOverrideDialog } from '@/components/backoffice/create-fee-override-dialog'
import { MOCK_GLOBAL_FEES } from '@/pages/backoffice/fees-page.mocks'
import type { UserFeeOverride } from '@/types/backoffice-fees'

interface UserFeeTabProps {
  userId: string
  userNome: string
  overrides: UserFeeOverride[]
  onCreate: (override: UserFeeOverride) => void
}

/**
 * Aba "Taxas" do detalhe do usuário — mostra a taxa especial ativa (se
 * houver) ou a taxa global padrão, com atalho para criar uma taxa especial
 * já pré-preenchida com este usuário (mock de UI, sem endpoint real).
 */
export function UserFeeTab({ userId, userNome, overrides, onCreate }: UserFeeTabProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const override = overrides.find((entry) => entry.userId === userId)

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        {override ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Taxa especial ativa</p>
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Maker fee</p>
                <p className="font-heading text-lg font-semibold tabular-nums">
                  {override.makerPercent === undefined
                    ? `usa global (${MOCK_GLOBAL_FEES.makerPercent.toFixed(2)}%)`
                    : `${override.makerPercent.toFixed(2)}%`}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Taker fee</p>
                <p className="font-heading text-lg font-semibold tabular-nums">
                  {override.takerPercent === undefined
                    ? `usa global (${MOCK_GLOBAL_FEES.takerPercent.toFixed(2)}%)`
                    : `${override.takerPercent.toFixed(2)}%`}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{override.motivo}</p>
            <p className="text-xs text-muted-foreground">
              Criada por {override.criadoPor} em{' '}
              {new Date(override.criadoEm).toLocaleString('pt-BR')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Usando taxa global (Maker {MOCK_GLOBAL_FEES.makerPercent.toFixed(2)}% / Taker{' '}
              {MOCK_GLOBAL_FEES.takerPercent.toFixed(2)}%)
            </p>
            <Button size="sm" className="w-fit" onClick={() => setCreateOpen(true)}>
              Criar taxa especial
            </Button>
          </div>
        )}
      </CardContent>

      <CreateFeeOverrideDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={onCreate}
        presetUser={{ userId, userNome }}
      />
    </Card>
  )
}
