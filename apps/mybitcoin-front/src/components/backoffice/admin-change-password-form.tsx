import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'

const MIN_PASSWORD_LENGTH = 8

interface PasswordFormState {
  atual: string
  nova: string
  confirmacao: string
}

const INITIAL_STATE: PasswordFormState = { atual: '', nova: '', confirmacao: '' }

function validate(state: PasswordFormState): string | null {
  if (state.nova.length < MIN_PASSWORD_LENGTH) {
    return `A nova senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`
  }
  if (state.nova !== state.confirmacao) {
    return 'A confirmação não corresponde à nova senha.'
  }
  return null
}

/**
 * Card "Alterar senha": validação client-side apenas (sem chamada de API).
 * Nunca loga os valores digitados — nem em console, nem em erro.
 */
export function AdminChangePasswordForm() {
  const { toast } = useToast()
  const [form, setForm] = useState<PasswordFormState>(INITIAL_STATE)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const validationError = validate(form)
    setError(validationError)
    if (validationError) return

    toast({ title: 'Senha alterada (simulação)', variant: 'success' })
    setForm(INITIAL_STATE)
  }

  function updateField(field: keyof PasswordFormState) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
      setError(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alterar senha</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldContent>
              <Label htmlFor="admin-senha-atual">Senha atual</Label>
              <Input
                id="admin-senha-atual"
                type="password"
                autoComplete="current-password"
                value={form.atual}
                onChange={updateField('atual')}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldContent>
              <Label htmlFor="admin-senha-nova">Nova senha</Label>
              <Input
                id="admin-senha-nova"
                type="password"
                autoComplete="new-password"
                value={form.nova}
                onChange={updateField('nova')}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldContent>
              <Label htmlFor="admin-senha-confirmacao">Confirmar nova senha</Label>
              <Input
                id="admin-senha-confirmacao"
                type="password"
                autoComplete="new-password"
                value={form.confirmacao}
                onChange={updateField('confirmacao')}
              />
            </FieldContent>
          </Field>

          {error && <FieldError>{error}</FieldError>}

          <Button type="submit" className="self-start">
            Alterar senha
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
