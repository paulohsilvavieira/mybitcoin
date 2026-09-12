import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import type { AdminProfile } from '@/types/backoffice-admin'

interface AdminPersonalInfoFormProps {
  admin: AdminProfile
}

/**
 * Card "Informações pessoais": nome e e-mail editáveis, cargo somente
 * leitura. Sem persistência real — apenas simula sucesso via toast.
 */
export function AdminPersonalInfoForm({ admin }: AdminPersonalInfoFormProps) {
  const { toast } = useToast()
  const [nome, setNome] = useState(admin.nome)
  const [email, setEmail] = useState(admin.email)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    toast({ title: 'Perfil atualizado (simulação)', variant: 'success' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações pessoais</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldContent>
              <Label htmlFor="admin-nome">Nome</Label>
              <Input id="admin-nome" value={nome} onChange={(event) => setNome(event.target.value)} />
            </FieldContent>
          </Field>

          <Field>
            <FieldContent>
              <Label htmlFor="admin-email">E-mail</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldContent>
              <Label htmlFor="admin-cargo">Cargo</Label>
              <Input id="admin-cargo" value={admin.cargo} disabled readOnly />
            </FieldContent>
          </Field>

          <Button type="submit" className="self-start">
            Salvar alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
