import { ThemeToggle } from '@/components/theme-toggle'
import { IdentitySection } from '@/pages/gallery/identity-section'
import { MarketSection } from '@/pages/gallery/market-section'
import { PrimitivesSection } from '@/pages/gallery/primitives-section'
import { TradingSection } from '@/pages/gallery/trading-section'
import { WalletSection } from '@/pages/gallery/wallet-section'

/**
 * Storybook interno: mostra todos os componentes visuais do projeto
 * (primitivos de UI + componentes de domínio) com dados mocados, para
 * revisão visual da migração de shadcn para Tailwind puro. Só existe em
 * desenvolvimento — ver guarda em `App.tsx` (`import.meta.env.DEV`). Não é
 * rota de produto: nunca linkar a partir de UI real.
 */
export function ComponentGalleryPage() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-6">
        <h1 className="font-heading text-lg font-semibold">Component Gallery</h1>
        <ThemeToggle />
      </header>

      <main className="flex flex-col items-center p-4 sm:p-6 lg:p-10">
        <div className="flex w-full max-w-[1600px] flex-col gap-12">
          <PrimitivesSection />
          <MarketSection />
          <TradingSection />
          <WalletSection />
          <IdentitySection />
        </div>
      </main>
    </div>
  )
}
