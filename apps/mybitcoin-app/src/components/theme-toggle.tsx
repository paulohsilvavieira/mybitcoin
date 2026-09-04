import { Moon, Sun } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Button } from '@/components/ui/button';
import { ICON_FOREGROUND } from '@/lib/icon-colors';
import { saveThemePreference } from '@/lib/theme-preference';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  /**
   * 'onBrandPanel': ícone sempre claro — pra usar sobre o `AuthBrandPanel`,
   * que é uma superfície fixa e escura, não reage ao tema (ver
   * `auth-brand-panel.tsx`). 'default': ícone reage ao tema, pra uso sobre
   * `--background`/`--card` normais (ex. `Topbar`).
   */
  variant?: 'default' | 'onBrandPanel';
}

/**
 * Alterna claro/escuro manualmente e persiste a escolha (`AsyncStorage`) pra
 * sobreviver a fechar o app por completo. Fonte única com
 * `@/hooks/use-color-scheme`.
 */
export function ThemeToggle({ className, variant = 'default' }: ThemeToggleProps) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  function handlePress() {
    const next = isDark ? 'light' : 'dark';
    setColorScheme(next);
    void saveThemePreference(next);
  }

  // Sobre o AuthBrandPanel (fixo, escuro) o ícone é sempre claro. Em
  // qualquer outra superfície, ele reage ao tema — igual ao --foreground.
  const iconColor =
    variant === 'onBrandPanel'
      ? ICON_FOREGROUND.light
      : ICON_FOREGROUND[isDark ? 'light' : 'dark'];

  return (
    <Button
      variant='ghost'
      size='icon'
      // O variant "ghost" do RNR tem `active:bg-accent`/`dark:active:bg-accent/50`
      // (destaque de toque) — sobrescrevemos pra transparente em qualquer estado.
      // `size-11` (44px) sobrescreve o `h-10 w-10` do variant "icon" — abaixo
      // do mínimo de toque de 44px.
      className={cn(
        'size-11 active:bg-transparent dark:active:bg-transparent',
        className,
      )}
      accessibilityLabel={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      onPress={handlePress}
    >
      {isDark ? (
        <Sun size={18} color={iconColor} />
      ) : (
        <Moon size={18} color={iconColor} />
      )}
    </Button>
  );
}
