import { LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import logoBase from '@/assets/base.svg'
import logoWhite from '@/assets/white.svg'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/use-theme-store'

interface NavItem {
  label: string
  to: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Carteira', to: '/preview/wallet' },
  { label: 'Negociação', to: '/preview/trading' },
]

interface TopbarProps {
  userName: string
}

/**
 * Casca de navegação compartilhada — protótipo pra decidir se topbar+sidebar
 * valem a pena antes de existir mais de 2 seções de produto (ver conversa).
 * Ainda não é usada nas rotas reais: os `to` apontam pras rotas de preview
 * de propósito, pra não bater no guard de auth. Logout aqui não desloga
 * nada de verdade.
 */
export function Topbar({ userName }: TopbarProps) {
  const theme = useThemeStore((state) => state.theme)

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-2 border-b border-border bg-card px-4 sm:gap-8 sm:px-6">
      <img
        src={theme === 'dark' ? logoWhite : logoBase}
        alt="mybitcoin"
        className="h-9 w-auto"
      />

      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                isActive && 'bg-muted text-foreground',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <div className="flex items-center gap-2 border-l border-border pl-2 sm:pl-4">
          <span className="hidden text-sm text-muted-foreground sm:inline">{userName}</span>
          <Button variant="ghost" size="icon" className="size-11" aria-label="Sair">
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
