import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { CreateTransferDialog } from '@/components/backoffice/create-transfer-dialog'
import { ScheduledTransfersTable } from '@/components/backoffice/scheduled-transfers-table'
import { useScheduledTransfersStore } from '@/stores/use-scheduled-transfers-store'

/** Página de transferências agendadas cold↔hot do backoffice (mock de UI). */
export function TransfersPage() {
  const transfers = useScheduledTransfersStore((state) => state.transfers)
  const createTransfer = useScheduledTransfersStore((state) => state.create)
  const cancelTransfer = useScheduledTransfersStore((state) => state.cancel)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  function handleCancel(id: string) {
    cancelTransfer(id)
    toast({ title: 'Transferência cancelada (simulação)', variant: 'success' })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold">Transferências</h1>
          <p className="text-sm text-muted-foreground">
            Transferências agendadas entre reservas cold e hot.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus />
          Nova transferência
        </Button>
      </div>

      <ScheduledTransfersTable transfers={transfers} onCancel={handleCancel} />

      <CreateTransferDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={createTransfer}
      />
    </div>
  )
}
