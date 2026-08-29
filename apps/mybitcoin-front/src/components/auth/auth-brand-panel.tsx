import waveBg from '@/assets/wave-haikei.svg'
import logoWhite from '@/assets/logo-text-horizontal-white.svg'
import { ThemeToggle } from '@/components/theme-toggle'

/**
 * O `ThemeToggle` vive aqui (não em `login-page.tsx`) porque esta é a única
 * superfície da tela que nunca muda de cor com o tema — no grid de desktop,
 * `top-4 right-4` relativo ao `main` cairia sobre o formulário (que sim
 * muda de cor), quebrando o contraste do ícone.
 */
export function AuthBrandPanel() {
  return (
    <div className="relative flex h-[36vh] shrink-0 items-center justify-center overflow-hidden bg-brand-panel lg:h-auto">
      <img
        src={waveBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <ThemeToggle className="absolute top-4 right-4 z-20 text-brand-panel-foreground hover:bg-brand-panel-foreground/10 hover:text-brand-panel-foreground" />

      <img
        src={logoWhite}
        alt="mybitcoin"
        className="relative w-96 max-w-[80%]"
      />
    </div>
  )
}
