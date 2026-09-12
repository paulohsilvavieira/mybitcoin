import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreateFeeOverrideDialog } from '@/components/backoffice/create-fee-override-dialog'
import { EditGlobalFeeDialog } from '@/components/backoffice/edit-global-fee-dialog'
import { GlobalFeeCard } from '@/components/backoffice/global-fee-card'
import { UserFeeOverridesTable } from '@/components/backoffice/user-fee-overrides-table'
import { MOCK_FEE_OVERRIDES, MOCK_GLOBAL_FEES } from '@/pages/backoffice/fees-page.mocks'
import type { GlobalFeeConfig, UserFeeOverride } from '@/types/backoffice-fees'

/** Página de gestão de taxas do backoffice — global e por usuário (mock de UI, sem endpoint real). */
export function FeesPage() {
  const [globalFees, setGlobalFees] = useState<GlobalFeeConfig>(MOCK_GLOBAL_FEES)
  const [overrides, setOverrides] = useState<UserFeeOverride[]>(MOCK_FEE_OVERRIDES)
  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Taxas</h1>
        <p className="text-sm text-muted-foreground">
          Taxas globais de negociação (maker/taker) e de saque, além de taxas especiais
          concedidas a usuários específicos.
        </p>
      </div>

      <GlobalFeeCard fees={globalFees} onEditClick={() => setEditOpen(true)} />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold">Taxas especiais por usuário</h2>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            Nova taxa especial
          </Button>
        </div>

        <UserFeeOverridesTable
          overrides={overrides}
          onRemove={(id) => setOverrides((prev) => prev.filter((override) => override.id !== id))}
        />
      </div>

      <EditGlobalFeeDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        fees={globalFees}
        onSave={setGlobalFees}
      />

      <CreateFeeOverrideDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(override) => setOverrides((prev) => [...prev, override])}
      />
    </div>
  )
}
