import { KeyRound, LogIn, ShieldAlert } from 'lucide-react'

interface ActivityItem {
  id: string
  icon: typeof LogIn
  label: string
  timestamp: string
}

// Dados mocados — protótipo visual, sem chamada de API real.
const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'act_1', icon: LogIn, label: 'Login via app mobile', timestamp: '10/09/2026 09:14' },
  { id: 'act_2', icon: KeyRound, label: 'Alteração de senha', timestamp: '02/09/2026 18:40' },
  {
    id: 'act_3',
    icon: ShieldAlert,
    label: 'Tentativa de login bloqueada (IP não reconhecido)',
    timestamp: '28/08/2026 23:07',
  },
  { id: 'act_4', icon: LogIn, label: 'Login via navegador', timestamp: '25/08/2026 08:02' },
]

/** Lista simples de login/ações do usuário — aba "Atividade" (mock de UI). */
export function UserActivityList() {
  return (
    <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
      {MOCK_ACTIVITY.map((item) => {
        const Icon = item.icon
        return (
          <li key={item.id} className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.label}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{item.timestamp}</span>
          </li>
        )
      })}
    </ul>
  )
}
