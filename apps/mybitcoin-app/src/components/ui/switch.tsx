import { useColorScheme } from '@/hooks/use-color-scheme';
import * as React from 'react';
import { Switch as RNSwitch } from 'react-native';

/**
 * O `Switch` nativo do RN não aceita `className` — `trackColor`/`thumbColor`
 * exigem strings de cor reais, não classes Tailwind. Os valores abaixo
 * espelham os mesmos tokens de `src/global.css` (--primary, --input,
 * --background/--card). Se um desses tokens mudar lá, recalcule aqui também
 * (mesma limitação já documentada em `src/lib/icon-colors.ts`).
 */
const TRACK_COLOR = {
  light: { false: 'rgb(225 226 224)', true: 'rgb(67 45 215)' },
  dark: { false: 'rgb(38 43 52)', true: 'rgb(55 42 172)' },
} as const;

const THUMB_COLOR = {
  light: 'rgb(255 255 255)',
  dark: 'rgb(23 27 34)',
} as const;

type SwitchProps = React.ComponentProps<typeof RNSwitch> & React.RefAttributes<RNSwitch>;

function Switch({ style, disabled, ...props }: SwitchProps) {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <RNSwitch
      disabled={disabled}
      trackColor={TRACK_COLOR[scheme]}
      thumbColor={THUMB_COLOR[scheme]}
      ios_backgroundColor={TRACK_COLOR[scheme].false}
      style={[disabled ? { opacity: 0.5 } : undefined, style]}
      {...props}
    />
  );
}

export { Switch };
export type { SwitchProps };
