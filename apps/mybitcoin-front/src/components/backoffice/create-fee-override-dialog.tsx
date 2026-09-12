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
  FeeOverrideFormFields,
  type FeeOverrideFormErrors,
  type FeeOverrideFormValues,
} from '@/components/backoffice/fee-override-form-fields'
import type { UserFeeOverride } from '@/types/backoffice-fees'

export interface CreateFeeOverrideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (override: UserFeeOverride) => void
  /** Pré-preenche usuário e trava o campo — usado na aba "Taxas" do detalhe do usuário. */
  presetUser?: { userId: string; userNome: string }
}

const EMPTY_VALUES: FeeOverrideFormValues = {
  userInput: '',
  makerPercent: '',
  takerPercent: '',
  motivo: '',
}

/**
 * Dialog de criação de taxa especial por usuário (mock de UI). Percentuais
 * são `number` e opcionais — pelo menos um dos dois deve ser preenchido.
 */
export function CreateFeeOverrideDialog({
  open,
  onOpenChange,
  onCreate,
  presetUser,
}: CreateFeeOverrideDialogProps) {
  const initialValues: FeeOverrideFormValues = {
    ...EMPTY_VALUES,
    userInput: presetUser?.userNome ?? '',
  }
  const [values, setValues] = useState<FeeOverrideFormValues>(initialValues)
  const [errors, setErrors] = useState<FeeOverrideFormErrors>({})
  const ids = {
    user: useId(),
    maker: useId(),
    taker: useId(),
    motivo: useId(),
  }
  const { toast } = useToast()

  function handleClose(next: boolean) {
    if (!next) {
      setValues(initialValues)
      setErrors({})
    }
    onOpenChange(next)
  }

  function handleConfirm() {
    const nextErrors: FeeOverrideFormErrors = {}
    if (values.userInput.trim() === '') nextErrors.user = 'Informe o ID ou nome do usuário.'
    if (values.makerPercent.trim() === '' && values.takerPercent.trim() === '') {
      nextErrors.percent = 'Preencha ao menos uma das taxas (maker ou taker).'
    }
    if (values.motivo.trim() === '') nextErrors.motivo = 'Informe o motivo da taxa especial.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onCreate({
      id: `fee_ov_${Date.now()}`,
      userId: presetUser?.userId ?? values.userInput.trim(),
      userNome: values.userInput.trim(),
      makerPercent: values.makerPercent.trim() === '' ? undefined : Number(values.makerPercent),
      takerPercent: values.takerPercent.trim() === '' ? undefined : Number(values.takerPercent),
      motivo: values.motivo.trim(),
      criadoPor: 'admin.paulo',
      criadoEm: new Date().toISOString(),
    })
    toast({ title: 'Taxa especial criada (simulação)', variant: 'success' })
    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogCloseButton onOpenChange={handleClose} />
      <DialogHeader>
        <DialogTitle>Nova taxa especial</DialogTitle>
        <DialogDescription>
          Sobrescreve a taxa global apenas para esse usuário. Essa é uma simulação — nenhuma
          mudança real é aplicada.
        </DialogDescription>
      </DialogHeader>

      <FeeOverrideFormFields
        ids={ids}
        values={values}
        errors={errors}
        userDisabled={!!presetUser}
        onChange={(patch) => {
          setValues((prev) => ({ ...prev, ...patch }))
          setErrors({})
        }}
      />

      <DialogFooter>
        <Button variant="outline" onClick={() => handleClose(false)}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm}>Criar taxa especial</Button>
      </DialogFooter>
    </Dialog>
  )
}
