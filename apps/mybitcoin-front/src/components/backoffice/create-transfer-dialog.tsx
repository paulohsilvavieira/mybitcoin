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
import { useToast } from '@/components/ui/toast'
import {
  type Reserva,
  TransferReservaSelect,
  WalletAssetSelect,
} from '@/components/backoffice/transfer-reserva-select'
import { TransferValueFields } from '@/components/backoffice/transfer-value-fields'
import type { ScheduledTransfer, WalletAsset } from '@/types/backoffice'

export interface CreateTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (transfer: Omit<ScheduledTransfer, 'id' | 'status'>) => void
  initialAsset?: WalletAsset
  initialOrigem?: Reserva
  initialDestino?: Reserva
}

/**
 * Dialog de nova transferência agendada entre reservas hot/cold — mock de
 * UI, nenhuma transferência real é criada. Valor sempre `string` (FIN-001).
 */
export function CreateTransferDialog({
  open,
  onOpenChange,
  onCreate,
  initialAsset = 'BTC',
  initialOrigem = 'cold',
  initialDestino = 'hot',
}: CreateTransferDialogProps) {
  const [asset, setAsset] = useState<WalletAsset>(initialAsset)
  const [origem, setOrigem] = useState<Reserva>(initialOrigem)
  const [destino, setDestino] = useState<Reserva>(initialDestino)
  const [valor, setValor] = useState('')
  const [agendadoPara, setAgendadoPara] = useState('')
  const [showError, setShowError] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)
  const assetId = useId()
  const origemId = useId()
  const destinoId = useId()
  const valorId = useId()
  const dataId = useId()
  const { toast } = useToast()

  // Reaplica os valores iniciais só quando o dialog abre — evita resetar o
  // formulário enquanto o usuário ainda está editando. Ajuste de estado
  // durante a renderização (sem efeito) para não disparar um render extra.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setAsset(initialAsset)
      setOrigem(initialOrigem)
      setDestino(initialDestino)
    }
  }

  function handleClose(next: boolean) {
    if (!next) {
      setValor('')
      setAgendadoPara('')
      setShowError(false)
    }
    onOpenChange(next)
  }

  function handleOrigemChange(next: Reserva) {
    setOrigem(next)
    if (next === destino) setDestino(next === 'hot' ? 'cold' : 'hot')
  }
  function handleDestinoChange(next: Reserva) {
    setDestino(next)
    if (next === origem) setOrigem(next === 'hot' ? 'cold' : 'hot')
  }

  function handleConfirm() {
    if (valor.trim() === '' || agendadoPara.trim() === '' || origem === destino) {
      setShowError(true)
      return
    }
    onCreate({ asset, origem, destino, valor, agendadoPara })
    toast({ title: 'Transferência agendada (simulação)', variant: 'success' })
    handleClose(false)
  }

  const errorMessage = showError
    ? origem === destino
      ? 'Origem e destino não podem ser iguais.'
      : 'Preencha o valor e a data agendada.'
    : undefined

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogCloseButton onOpenChange={handleClose} />
      <DialogHeader>
        <DialogTitle>Nova transferência</DialogTitle>
        <DialogDescription>
          Agende uma transferência entre reservas. Essa é uma simulação — nenhum fundo é movido.
        </DialogDescription>
      </DialogHeader>

      <WalletAssetSelect id={assetId} value={asset} onChange={setAsset} />

      <div className="flex flex-col gap-4 sm:flex-row">
        <TransferReservaSelect id={origemId} label="Origem" value={origem} onChange={handleOrigemChange} />
        <TransferReservaSelect id={destinoId} label="Destino" value={destino} onChange={handleDestinoChange} />
      </div>

      <TransferValueFields
        valorId={valorId}
        dataId={dataId}
        valor={valor}
        agendadoPara={agendadoPara}
        errorMessage={errorMessage}
        onValorChange={(value) => {
          setValor(value)
          setShowError(false)
        }}
        onAgendadoParaChange={(value) => {
          setAgendadoPara(value)
          setShowError(false)
        }}
      />

      <DialogFooter>
        <Button variant="outline" onClick={() => handleClose(false)}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm}>Confirmar</Button>
      </DialogFooter>
    </Dialog>
  )
}
