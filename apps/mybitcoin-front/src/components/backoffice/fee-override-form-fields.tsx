import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const textareaClassName = cn(
  'w-full min-w-0 resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30',
)

export interface FeeOverrideFormErrors {
  user?: string
  percent?: string
  motivo?: string
}

export interface FeeOverrideFormValues {
  userInput: string
  makerPercent: string
  takerPercent: string
  motivo: string
}

interface FeeOverrideFormFieldsProps {
  ids: { user: string; maker: string; taker: string; motivo: string }
  values: FeeOverrideFormValues
  errors: FeeOverrideFormErrors
  userDisabled?: boolean
  onChange: (patch: Partial<FeeOverrideFormValues>) => void
}

/** Campos do formulário de taxa especial — compartilhado por criação (dialog) e edição futura. */
export function FeeOverrideFormFields({
  ids,
  values,
  errors,
  userDisabled,
  onChange,
}: FeeOverrideFormFieldsProps) {
  return (
    <>
      <Field data-invalid={!!errors.user}>
        <Label htmlFor={ids.user}>Usuário</Label>
        <Input
          id={ids.user}
          value={values.userInput}
          disabled={userDisabled}
          onChange={(event) => onChange({ userInput: event.target.value })}
          placeholder="ID ou nome do usuário"
        />
        {errors.user && <FieldError>{errors.user}</FieldError>}
      </Field>

      <div className="flex gap-3">
        <Field data-invalid={!!errors.percent}>
          <Label htmlFor={ids.maker}>Maker % (opcional)</Label>
          <Input
            id={ids.maker}
            type="number"
            step="0.01"
            min="0"
            value={values.makerPercent}
            onChange={(event) => onChange({ makerPercent: event.target.value })}
          />
        </Field>
        <Field data-invalid={!!errors.percent}>
          <Label htmlFor={ids.taker}>Taker % (opcional)</Label>
          <Input
            id={ids.taker}
            type="number"
            step="0.01"
            min="0"
            value={values.takerPercent}
            onChange={(event) => onChange({ takerPercent: event.target.value })}
          />
        </Field>
      </div>
      {errors.percent && <FieldError>{errors.percent}</FieldError>}

      <Field data-invalid={!!errors.motivo}>
        <Label htmlFor={ids.motivo}>Motivo</Label>
        <textarea
          id={ids.motivo}
          rows={3}
          value={values.motivo}
          aria-invalid={!!errors.motivo}
          onChange={(event) => onChange({ motivo: event.target.value })}
          placeholder="Descreva o motivo da taxa especial…"
          className={textareaClassName}
        />
        {errors.motivo && <FieldError>{errors.motivo}</FieldError>}
      </Field>
    </>
  )
}
