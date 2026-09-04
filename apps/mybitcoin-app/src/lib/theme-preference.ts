import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';

/**
 * Preferência de tema escolhida manualmente pelo usuário. Não é dado
 * sensível (nunca `expo-secure-store`) — só uma preferência de UI, mesma
 * categoria de dado que `AsyncStorage` foi feito pra guardar.
 */
const STORAGE_KEY = 'mybitcoin-theme';

type ThemePreference = 'light' | 'dark';

/**
 * Lê a preferência salva e aplica no NativeWind, se existir. Sem preferência
 * salva (usuário nunca trocou manualmente), não faz nada — o NativeWind já
 * segue o tema do sistema sozinho por padrão.
 */
export async function loadThemePreference(): Promise<void> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    colorScheme.set(stored);
  }
}

export async function saveThemePreference(
  theme: ThemePreference,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, theme);
}
