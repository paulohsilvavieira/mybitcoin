import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogCloseButton,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldContent } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import type { WalletAsset } from '@/types/backoffice'
import type { GlobalFeeConfig } from '@/types/backoffice-fees'

const ASSETS: WalletAsset[] = ['BTC', 'ETH', 'SOL', 'USDT']

export interface EditGlobalFeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fees: GlobalFeeConfig
  onSave: (fees: GlobalFeeConfig) => void
}

/**
 * Dialog de edição da configuração global de taxas (mock de UI). Percentuais
 * são `number` (não seguem FIN-001, não são valores monetários); taxas de
 * saque permanecem `string` em satoshi/menor-unidade (FIN-001/002) — o input
 * edita o valor bruto, sem conversão para `number`.
 */
export function EditGlobalFeeDialog({ open, onOpenChange, fees, onSave }: EditGlobalFeeDialogProps) {
  const [draft, setDraft] = useState<GlobalFeeConfig>(fees)
  const makerId = useId()
  const takerId = useId()
  const { toast } = useToast()

  function handleClose(next: boolean) {
    if (!next) setDraft(fees)
    onOpenChange(next)
  }

  function handleConfirm() {
    onSave(draft)
    toast({ title: 'Taxas atualizadas (simulação)', variant: 'success' })
    handleClose(false)
  }

  function setWithdrawalFee(asset: WalletAsset, value: string) {
    setDraft((prev) => ({
      ...prev,
      withdrawalFeeSatoshi: { ...prev.withdrawalFeeSatoshi, [asset]: value },
    }))
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogCloseButton onOpenChange={handleClose} />
      <DialogHeader>
        <DialogTitle>Editar taxas globais</DialogTitle>
        <DialogDescription>
          Aplicada a todos os usuários sem taxa especial. Essa é uma simulação — nenhuma mudança
          real é aplicada.
        </DialogDescription>
      </DialogHeader>

      <div className="flex gap-3">
        <Field>
          <Label htmlFor={makerId}>Maker fee</Label>
          <div className="flex items-center gap-1.5">
            <Input
              id={makerId}
              type="number"
              step="0.01"
              min="0"
              value={draft.makerPercent}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, makerPercent: Number(event.target.value) }))
              }
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </Field>
        <Field>
          <Label htmlFor={takerId}>Taker fee</Label>
          <div className="flex items-center gap-1.5">
            <Input
              id={takerId}
              type="number"
              step="0.01"
              min="0"
              value={draft.takerPercent}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, takerPercent: Number(event.target.value) }))
              }
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </Field>
      </div>

      <FieldContent>
        <p className="text-xs text-muted-foreground">
          Taxa de saque (fixa, em satoshi/menor-unidade)
        </p>
        <div className="grid grid-cols-2 gap-3">
          {ASSETS.map((asset) => {
            const inputId = `${makerId}-withdrawal-${asset}`
            return (
              <Field key={asset}>
                <Label htmlFor={inputId}>{asset}</Label>
                <Input
                  id={inputId}
                  inputMode="numeric"
                  value={draft.withdrawalFeeSatoshi[asset]}
                  onChange={(event) => setWithdrawalFee(asset, event.target.value)}
                />
              </Field>
            )
          })}
        </div>
      </FieldContent>

      <DialogFooter>
        <Button variant="outline" onClick={() => handleClose(false)}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm}>Salvar</Button>
      </DialogFooter>
    </Dialog>
  )
}
