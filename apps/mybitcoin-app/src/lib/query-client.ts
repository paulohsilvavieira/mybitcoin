import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { AppState, type AppStateStatus, Platform } from 'react-native';

/**
 * Ao contrário do browser, o TanStack Query no React Native não reavalia
 * queries sozinho quando a rede reconecta ou o app volta do background — é
 * opt-in nesta plataforma.
 * https://tanstack.com/query/latest/docs/framework/react/react-native
 *
 * As inscrições são puladas no render estático da web (ambiente Node do
 * `expo export`/SSR), onde não existe `window` nem noção de rede/foco.
 */
const canSubscribeToPlatformEvents = typeof window !== 'undefined';

if (canSubscribeToPlatformEvents) {
  // Online status management — `expo-network` em vez de `@react-native-community/netinfo`
  // (já é do ecossistema Expo, sem dependência nativa extra).
  onlineManager.setEventListener((setOnline) => {
    const subscription = Network.addNetworkStateListener((state) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return () => subscription.remove();
  });

  // Refetch on App focus — na web o comportamento de foco do browser já funciona nativamente.
  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    });
  }
}

export const queryClient = new QueryClient();
