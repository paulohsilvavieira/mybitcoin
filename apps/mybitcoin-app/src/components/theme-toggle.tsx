import { Moon, Sun } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Button } from '@/components/ui/button';
import { ICON_FOREGROUND } from '@/lib/icon-colors';
import { saveThemePreference } from '@/lib/theme-preference';
import { cn } from '@/lib/utils';

/**
 * Alterna claro/escuro manualmente e persiste a escolha (`AsyncStorage`) pra
 * sobreviver a fechar o app por completo. Fonte única com
 * `@/hooks/use-color-scheme`.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { colorScheme, setColorScheme } = useColorScheme();

  function handlePress() {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(next);
    void saveThemePreference(next);
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      // O variant "ghost" do RNR tem `active:bg-accent`/`dark:active:bg-accent/50`
      // (destaque de toque) — sobrescrevemos pra transparente em qualquer estado.
      className={cn(
        'active:bg-transparent dark:active:bg-transparent',
        className,
      )}
      accessibilityLabel={
        colorScheme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'
      }
      onPress={handlePress}
    >
      {/*
        Cor sempre clara nos dois ícones, mesmo em modo claro do app: este
        botão só é usado na tela de login, sobre o fundo fixo e escuro do
        AuthBrandPanel — não sobre o `--background` do tema (esse sim muda
        de claro pra escuro). Se um dia este componente for reusado em outro
        lugar com fundo claro atrás, a cor precisa voltar a ser condicional.
      */}
      {colorScheme === 'dark' ? (
        <Sun size={18} color={ICON_FOREGROUND.light} />
      ) : (
        <Moon size={18} color={ICON_FOREGROUND.light} />
      )}
    </Button>
  );
}
