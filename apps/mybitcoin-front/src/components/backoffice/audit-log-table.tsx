import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AuditActionType, AuditLogEntry } from '@/types/backoffice'

type ActionFilter = AuditActionType | 'all'

const ACTION_TABS: { value: ActionFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'bloqueio_usuario', label: 'Bloqueios' },
  { value: 'estorno', label: 'Estornos' },
  { value: 'transferencia_agendada', label: 'Transferências' },
  { value: 'transferencia_cancelada', label: 'Cancelamentos' },
]

interface AuditLogTableProps {
  entries: AuditLogEntry[]
}

function filterEntries(entries: AuditLogEntry[], search: string, action: ActionFilter) {
  const normalizedSearch = search.trim().toLowerCase()

  return entries.filter((entry) => {
    const matchesAction = action === 'all' || entry.actionType === action
    const matchesSearch =
      normalizedSearch === '' ||
      entry.acao.toLowerCase().includes(normalizedSearch) ||
      entry.alvo.toLowerCase().includes(normalizedSearch) ||
      entry.adminNome.toLowerCase().includes(normalizedSearch)
    return matchesAction && matchesSearch
  })
}

/** Tabela de auditoria de ações administrativas, com filtro por tipo e busca (mock de UI). */
export function AuditLogTable({ entries }: AuditLogTableProps) {
  const [search, setSearch] = useState('')
  const [action, setAction] = useState<ActionFilter>('all')

  const filtered = useMemo(
    () => filterEntries(entries, search, action),
    [entries, search, action],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-sm flex-col gap-1.5">
          <Label htmlFor="audit-search" className="sr-only">
            Buscar na auditoria
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="audit-search"
              placeholder="Buscar por admin, ação ou alvo"
              className="pl-8"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <Tabs value={action} onValueChange={(value) => setAction(value as ActionFilter)}>
          <TabsList>
            {ACTION_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/hora</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Alvo</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                  {new Date(entry.dataHora).toLocaleString('pt-BR')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar name={entry.adminNome} src={entry.adminAvatarUrl} className="size-7" />
                    <span className="text-sm font-medium">{entry.adminNome}</span>
                  </div>
                </TableCell>
                <TableCell>{entry.acao}</TableCell>
                <TableCell className="text-muted-foreground">{entry.alvo}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.detalhes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum registro encontrado para esse filtro.
          </p>
        )}
      </div>
    </div>
  )
}
