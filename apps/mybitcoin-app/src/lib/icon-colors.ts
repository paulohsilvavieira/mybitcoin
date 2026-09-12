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

/**
 * Mesma limitação — `react-native-svg` (sparklines/gráficos) também não
 * aceita `className`, só cor real via prop. Espelham `--success`/
 * `--destructive` de `src/global.css`.
 */
export const ICON_SUCCESS = { light: '#1A7F42', dark: '#34D399' } as const;
export const ICON_DESTRUCTIVE = { light: '#D93526', dark: '#F0554A' } as const;
