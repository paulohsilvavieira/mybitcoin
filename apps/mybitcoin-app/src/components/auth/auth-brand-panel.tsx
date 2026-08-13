import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

/**
 * Painel de marca do fluxo de auth — porte do `auth-brand-panel.tsx` do
 * `../mybitcoin-front`, trocando `<img>` por `expo-image` (o Metro já resolve
 * `.svg` como asset). `expo-image` não é um componente interoperado pelo
 * NativeWind, então o posicionamento aqui usa `StyleSheet` em vez de `className`.
 */
export function AuthBrandPanel() {
  return (
    <View className='h-[36vh] shrink-0 items-center justify-center overflow-hidden'>
      <Image
        source={require('@/assets/images/wave-haikei.svg')}
        contentFit='cover'
        accessible={false}
        style={styles.background}
      />
      <Image
        source={require('@/assets/images/logo-text-horizontal-white.svg')}
        contentFit='contain'
        accessibilityLabel='mybitcoin'
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logo: {
    width: 324,
    maxWidth: '80%',
    height: 106,
  },
});
