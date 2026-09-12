import { Link, Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/backoffice/admin-sidebar'
import { RoleSwitcher } from '@/components/backoffice/role-switcher'
import { Avatar } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'

const MOCK_ADMIN_NAME = 'Ana Beatriz'

/**
 * Casca de layout do backoffice: sidebar fixa + header simples + conteúdo
 * da rota filha. Só existe em rotas `/preview/backoffice/*` (DEV-only, ver
 * `App.tsx`) — protótipo visual, sem autenticação real.
 */
export function AdminLayout() {
  return (
    <div className="flex h-dvh">
      <AdminSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-end gap-3 border-b border-border bg-card px-6">
          <RoleSwitcher />
          <ThemeToggle />
          <Link
            to="/preview/backoffice/settings"
            className="flex h-11 items-center gap-2 border-l border-border pl-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Avatar name={MOCK_ADMIN_NAME} className="size-8 text-xs" />
            <span>{MOCK_ADMIN_NAME} · Admin</span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
