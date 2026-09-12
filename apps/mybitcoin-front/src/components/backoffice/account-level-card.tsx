import { useState } from 'react'
import { AccountLevelDialog } from '@/components/backoffice/account-level-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ACCOUNT_LEVELS, ACCOUNT_LEVEL_LABELS } from '@/lib/account-level'
import { cn, formatCurrency } from '@/lib/utils'
import type { AccountLevel } from '@/types/backoffice'

/**
 * Limites de depósito e saque por nível, de
 * `docs/bussiness/09-depositos-e-saques.md` (seções 2.6 e 3.5). Valores em
 * BRL, exibidos via `formatCurrency()` — não são satoshi.
 */
const LEVEL_LIMITS: Record<AccountLevel, { depositoMin: number; depositoMax: number; saqueDiario: number }> = {
  basico: { depositoMin: 10, depositoMax: 10_000, saqueDiario: 5_000 },
  intermediario: { depositoMin: 10, depositoMax: 100_000, saqueDiario: 50_000 },
  avancado: { depositoMin: 10, depositoMax: 1_000_000, saqueDiario: 500_000 },
}

export interface AccountLevelCardProps {
  userName: string
  accountLevel: AccountLevel
}

/** Card de nível de conta e limites de depósito/saque — mock de UI do backoffice. */
export function AccountLevelCard({ userName, accountLevel }: AccountLevelCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Nível da conta</CardTitle>
        <Badge variant="default">{ACCOUNT_LEVEL_LABELS[accountLevel]}</Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nível</TableHead>
                <TableHead>Depósito mín. diário</TableHead>
                <TableHead>Depósito máx. diário</TableHead>
                <TableHead>Saque máx. diário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ACCOUNT_LEVELS.map((level) => {
                const limits = LEVEL_LIMITS[level]
                const isCurrent = level === accountLevel
                return (
                  <TableRow
                    key={level}
                    className={cn(isCurrent && 'border-l-2 border-l-primary bg-muted')}
                  >
                    <TableCell className="font-medium">{ACCOUNT_LEVEL_LABELS[level]}</TableCell>
                    <TableCell>{formatCurrency(limits.depositoMin)}</TableCell>
                    <TableCell>{formatCurrency(limits.depositoMax)}</TableCell>
                    <TableCell>{formatCurrency(limits.saqueDiario)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        <Button variant="outline" className="self-start" onClick={() => setDialogOpen(true)}>
          Alterar nível
        </Button>
      </CardContent>

      <AccountLevelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentLevel={accountLevel}
        userName={userName}
      />
    </Card>
  )
}
