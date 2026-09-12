import '@/global.css';

import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  useFonts,
} from '@expo-google-fonts/geist';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrentUser } from '@/hooks/use-current-user';
import { queryClient } from '@/lib/query-client';
import { NAV_THEME } from '@/lib/theme';
import { loadThemePreference } from '@/lib/theme-preference';

SplashScreen.preventAutoHideAsync();

/**
 * A fonte de verdade do guard é o cache do TanStack Query (`useCurrentUser`),
 * nunca um Context de sessão paralelo (ADR 0001, Rationale). Precisa viver
 * abaixo do `QueryClientProvider`, por isso está separado do layout raiz.
 */
function RootNavigator() {
  const { data: user, isPending } = useCurrentUser();

  // Mantém o splash até saber se existe sessão — evita desenhar `login` para
  // quem já está autenticado (e vice-versa).
  if (isPending) return null;

  const isAuthenticated = Boolean(user);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name='(tabs)' />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name='login' />
      </Stack.Protected>

      {/* Rotas de preview visual, sem auth — mesmo espírito do
          `/preview/*` do `../mybitcoin-front`. Não são rota de produto:
          nunca linkar a partir de UI real. */}
      <Stack.Screen name='preview-wallet' />
      <Stack.Screen name='preview-trading' />
      <Stack.Screen name='preview-market' />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  const [themeLoaded, setThemeLoaded] = useState(false);
  useEffect(() => {
    loadThemePreference().finally(() => setThemeLoaded(true));
  }, []);

  if (!fontsLoaded || !themeLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        value={colorScheme === 'dark' ? NAV_THEME.dark : NAV_THEME.light}
      >
        <AnimatedSplashOverlay />
        <RootNavigator />
        <PortalHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
