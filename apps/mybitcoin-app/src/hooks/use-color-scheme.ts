import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

/**
 * Fonte única do color scheme do app — não usar `react-native`'s
 * `useColorScheme` direto em nenhum outro lugar. O NativeWind já cai pro
 * sistema automaticamente até alguém chamar `setColorScheme`/`toggleColorScheme`
 * (ver `@/components/theme-toggle`), e isso mantém os dois sistemas de estilo
 * do app (NativeWind `className` e o `Colors`/`useTheme` antigo) sincronizados
 * com a mesma escolha do usuário.
 */
export function useColorScheme() {
  const { colorScheme } = useNativeWindColorScheme();
  return colorScheme;
}
