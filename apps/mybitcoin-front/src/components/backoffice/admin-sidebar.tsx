import {
  ArrowLeftRight,
  ArrowUpFromLine,
  LayoutDashboard,
  LineChart,
  Percent,
  ShieldCheck,
  Users,
  UserCog,
  Wallet,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import logoBase from '@/assets/base.svg'
import logoWhite from '@/assets/white.svg'
import { cn } from '@/lib/utils'
import { useAdminRoleStore } from '@/stores/use-admin-role-store'
import { useThemeStore } from '@/stores/use-theme-store'
import { hasPermission, type AdminPermission } from '@/types/backoffice-roles'

interface NavItem {
  label: string
  to: string
  icon: typeof LayoutDashboard
  /** Item sempre visível quando omitido. */
  requires?: AdminPermission
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/preview/backoffice', icon: LayoutDashboard },
  { label: 'Usuários', to: '/preview/backoffice/users', icon: Users, requires: 'users.view' },
  { label: 'Carteiras', to: '/preview/backoffice/wallets', icon: Wallet, requires: 'wallets.view' },
  {
    label: 'Transferências',
    to: '/preview/backoffice/transfers',
    icon: ArrowLeftRight,
    requires: 'wallets.transfer',
  },
  {
    label: 'Saques',
    to: '/preview/backoffice/withdrawals',
    icon: ArrowUpFromLine,
    requires: 'withdrawals.review',
  },
  { label: 'Mercados', to: '/preview/backoffice/markets', icon: LineChart, requires: 'markets.manage' },
  { label: 'Taxas', to: '/preview/backoffice/fees', icon: Percent, requires: 'fees.manage' },
  { label: 'Auditoria', to: '/preview/backoffice/audit', icon: ShieldCheck, requires: 'audit.view' },
  {
    label: 'Administradores',
    to: '/preview/backoffice/admins',
    icon: UserCog,
    requires: 'admins.manage',
  },
]

/**
 * Navegação lateral fixa do backoffice administrativo. Mesmo padrão visual
 * de estado ativo do `Topbar` (`bg-muted text-foreground`) — ver
 * `src/components/layout/topbar.tsx`. Itens com `requires` só aparecem
 * quando o papel atual (`useAdminRoleStore`) tem a permissão correspondente.
 */
export function AdminSidebar() {
  const role = useAdminRoleStore((state) => state.role)
  const theme = useThemeStore((state) => state.theme)
  const visibleItems = NAV_ITEMS.filter((item) => !item.requires || hasPermission(role, item.requires))

  return (
    <aside className="flex h-dvh w-60 shrink-0 flex-col gap-1 border-r border-border bg-card p-3">
      <div className="flex h-14 items-center gap-2 px-2">
        <img
          src={theme === 'dark' ? logoWhite : logoBase}
          alt="mybitcoin"
          className="h-8 w-auto"
        />
        <span className="text-xs text-muted-foreground">admin</span>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Navegação do backoffice">
        {visibleItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/preview/backoffice'}
              className={({ isActive }) =>
                cn(
                  'flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'bg-muted text-foreground',
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
