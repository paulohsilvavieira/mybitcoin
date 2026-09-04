import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';

/**
 * Mesmos tokens de `src/global.css` (espelhados de ../mybitcoin-front),
 * em `rgb()` para uso fora do NativeWind — hoje só o NAV_THEME abaixo,
 * que alimenta o `ThemeProvider` do React Navigation (header, tab bar
 * nativa, etc.). Se um token mudar em `global.css`, atualize aqui também.
 */
export const THEME = {
  light: {
    background: 'rgb(255 255 255)',
    foreground: 'rgb(9 14 19)',
    card: 'rgb(255 255 255)',
    cardForeground: 'rgb(9 14 19)',
    popover: 'rgb(255 255 255)',
    popoverForeground: 'rgb(9 14 19)',
    primary: 'rgb(19 90 228)',
    primaryForeground: 'rgb(252 252 252)',
    secondary: 'rgb(239 242 246)',
    secondaryForeground: 'rgb(9 14 19)',
    muted: 'rgb(239 242 246)',
    mutedForeground: 'rgb(98 106 115)',
    accent: 'rgb(224 236 255)',
    accentForeground: 'rgb(0 44 136)',
    destructive: 'rgb(223 32 46)',
    destructiveForeground: 'rgb(252 252 252)',
    border: 'rgb(225 229 234)',
    input: 'rgb(225 229 234)',
    ring: 'rgb(19 90 228)',
    radius: '8px',
  },
  dark: {
    background: 'rgb(7 11 17)',
    foreground: 'rgb(243 245 248)',
    card: 'rgb(15 20 27)',
    cardForeground: 'rgb(243 245 248)',
    popover: 'rgb(15 20 27)',
    popoverForeground: 'rgb(243 245 248)',
    primary: 'rgb(69 130 250)',
    primaryForeground: 'rgb(7 11 17)',
    secondary: 'rgb(31 37 44)',
    secondaryForeground: 'rgb(243 245 248)',
    muted: 'rgb(31 37 44)',
    mutedForeground: 'rgb(147 153 161)',
    accent: 'rgb(27 41 66)',
    accentForeground: 'rgb(177 207 255)',
    destructive: 'rgb(241 77 76)',
    destructiveForeground: 'rgb(7 11 17)',
    border: 'rgb(32 35 41)',
    input: 'rgb(37 40 46)',
    ring: 'rgb(69 130 250)',
    radius: '8px',
  },
} as const;

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
