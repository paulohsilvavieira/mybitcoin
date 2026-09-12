import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogCloseButton,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import type { UserFeeOverride } from '@/types/backoffice-fees'

interface UserFeeOverridesTableProps {
  overrides: UserFeeOverride[]
  onRemove: (id: string) => void
}

/**
 * Percentuais são `number` e opcionais — quando `undefined`, o usuário usa a
 * taxa global (não são valores monetários, então não seguem FIN-001).
 */
function formatPercent(percent: number | undefined): string {
  return percent === undefined ? 'usa taxa global' : `${percent.toFixed(2)}%`
}

/** Tabela de taxas especiais por usuário — remoção via dialog de confirmação (mock de UI). */
export function UserFeeOverridesTable({ overrides, onRemove }: UserFeeOverridesTableProps) {
  const [pendingRemoval, setPendingRemoval] = useState<UserFeeOverride | null>(null)
  const { toast } = useToast()

  function handleConfirmRemoval() {
    if (!pendingRemoval) return
    onRemove(pendingRemoval.id)
    toast({ title: 'Taxa especial removida (simulação)', variant: 'success' })
    setPendingRemoval(null)
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Maker %</TableHead>
            <TableHead>Taker %</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Criado por</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {overrides.map((override) => (
            <TableRow key={override.id}>
              <TableCell className="font-medium">{override.userNome}</TableCell>
              <TableCell className="tabular-nums">{formatPercent(override.makerPercent)}</TableCell>
              <TableCell className="tabular-nums">{formatPercent(override.takerPercent)}</TableCell>
              <TableCell className="max-w-64 truncate text-sm text-muted-foreground">
                {override.motivo}
              </TableCell>
              <TableCell>{override.criadoPor}</TableCell>
              <TableCell>{new Date(override.criadoEm).toLocaleString('pt-BR')}</TableCell>
              <TableCell>
                <Button variant="destructive" size="sm" onClick={() => setPendingRemoval(override)}>
                  Remover
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {overrides.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhuma taxa especial cadastrada.
        </p>
      )}

      <Dialog open={pendingRemoval !== null} onOpenChange={(open) => !open && setPendingRemoval(null)}>
        <DialogCloseButton onOpenChange={(open) => !open && setPendingRemoval(null)} />
        <DialogHeader>
          <DialogTitle>Remover taxa especial</DialogTitle>
          <DialogDescription>
            {pendingRemoval?.userNome} voltará a usar a taxa global (Maker/Taker padrão). Essa é
            uma simulação — nenhuma mudança real é aplicada.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPendingRemoval(null)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirmRemoval}>
            Remover
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
