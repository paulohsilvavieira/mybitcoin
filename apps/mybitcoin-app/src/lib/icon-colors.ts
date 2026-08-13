/**
 * Ícones de libs como lucide-react-native não recebem cor via `className`
 * (sem cssInterop registrado nesta versão) — só via prop `color`. Espelha os
 * mesmos valores de `--foreground`/`--muted-foreground` em `src/global.css`.
 * Se um desses tokens mudar lá, atualize aqui também.
 */
export const ICON_FOREGROUND = { dark: '#090E13', light: '#F3F5F8' } as const;
export const ICON_MUTED_FOREGROUND = {
  light: '#626A73',
  dark: '#9399A1',
} as const;
