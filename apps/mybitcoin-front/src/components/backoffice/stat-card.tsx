import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  /** Variação opcional, ex: "+3 hoje" ou "-2 vs. ontem". */
  change?: string
  changeTone?: 'positive' | 'negative' | 'neutral'
}

const CHANGE_TONE_CLASSES = {
  positive: 'text-success',
  negative: 'text-destructive',
  neutral: 'text-muted-foreground',
} as const

/** Card de KPI genérico reutilizável em dashboards do backoffice. */
export function StatCard({ label, value, icon: Icon, change, changeTone = 'neutral' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl font-semibold tabular-nums">{value}</p>
          {change && (
            <p className={cn('text-xs font-medium', CHANGE_TONE_CLASSES[changeTone])}>{change}</p>
          )}
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  )
}
