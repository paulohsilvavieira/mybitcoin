import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TransferValueFieldsProps {
  valorId: string
  dataId: string
  valor: string
  agendadoPara: string
  errorMessage?: string
  onValorChange: (value: string) => void
  onAgendadoParaChange: (value: string) => void
}

/** Campos de valor e data agendada do dialog de nova transferência. */
export function TransferValueFields({
  valorId,
  dataId,
  valor,
  agendadoPara,
  errorMessage,
  onValorChange,
  onAgendadoParaChange,
}: TransferValueFieldsProps) {
  return (
    <>
      <Field data-invalid={!!errorMessage && valor.trim() === ''}>
        <Label htmlFor={valorId}>Valor</Label>
        <Input
          id={valorId}
          inputMode="decimal"
          placeholder="0.00000000"
          value={valor}
          aria-invalid={!!errorMessage && valor.trim() === ''}
          onChange={(event) => onValorChange(event.target.value)}
        />
      </Field>

      <Field data-invalid={!!errorMessage && agendadoPara.trim() === ''}>
        <Label htmlFor={dataId}>Data e hora agendada</Label>
        <Input
          id={dataId}
          type="datetime-local"
          value={agendadoPara}
          aria-invalid={!!errorMessage && agendadoPara.trim() === ''}
          onChange={(event) => onAgendadoParaChange(event.target.value)}
        />
        {errorMessage && <FieldError>{errorMessage}</FieldError>}
      </Field>
    </>
  )
}
