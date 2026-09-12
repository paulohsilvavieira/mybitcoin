import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/toast'
import { ADMIN_ROLE_BADGE_VARIANT } from '@/components/backoffice/admin-permission-labels'
import { ADMIN_ROLE_LABELS, type AdminMember } from '@/types/backoffice-roles'

interface AdminMembersTableProps {
  members: AdminMember[]
  onChangeRoleClick: (member: AdminMember) => void
  onToggleAtivo: (memberId: string, ativo: boolean) => void
}

/** Tabela de administradores do backoffice — troca de papel e ativar/desativar (mock de UI). */
export function AdminMembersTable({ members, onChangeRoleClick, onToggleAtivo }: AdminMembersTableProps) {
  const { toast } = useToast()

  function handleToggle(member: AdminMember) {
    const next = !member.ativo
    onToggleAtivo(member.id, next)
    toast({
      title: next ? 'Administrador ativado (simulação)' : 'Administrador desativado (simulação)',
      variant: 'success',
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Membro</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar name={member.nome} />
                  <div className="flex flex-col">
                    <span className="font-medium">{member.nome}</span>
                    <span className="text-sm text-muted-foreground">{member.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={ADMIN_ROLE_BADGE_VARIANT[member.role]}>
                  {ADMIN_ROLE_LABELS[member.role]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={member.ativo ? 'success' : 'outline'}>
                  {member.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>{new Date(member.criadoEm).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => onChangeRoleClick(member)}>
                    Alterar papel
                  </Button>
                  <Switch
                    checked={member.ativo}
                    onCheckedChange={() => handleToggle(member)}
                    aria-label={member.ativo ? 'Desativar administrador' : 'Ativar administrador'}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {members.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum administrador cadastrado.
        </p>
      )}
    </div>
  )
}
