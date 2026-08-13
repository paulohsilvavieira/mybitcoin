import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web.
 * Ver `use-color-scheme.ts` (native) — mesma fonte única via NativeWind.
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const { colorScheme } = useNativeWindColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
