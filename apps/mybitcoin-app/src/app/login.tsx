import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthBrandPanel } from '@/components/auth/auth-brand-panel';
import { LoginForm } from '@/components/auth/login-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Text } from '@/components/ui/text';

/**
 * Tela de login — porte do `login-page.tsx` do `../mybitcoin-front`.
 *
 * Não faz o guard de "já autenticado" aqui: quem decide se esta rota é
 * alcançável é o `Stack.Protected` do layout raiz (ADR 0001, Decisão item 2).
 * Fica fora das tabs, então usa `SafeAreaView` própria.
 *
 * `KeyboardAvoidingView` é obrigatório aqui: um `ScrollView` sozinho não
 * empurra o conteúdo quando o teclado abre — sem ele, `contentContainerClassName="grow"`
 * só espreme o Card no espaço que resta em vez de deixá-lo scrollável.
 */
export default function LoginScreen() {
  return (
    <KeyboardAvoidingView
      className='bg-background flex-1'
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0}
    >
      <SafeAreaView edges={['top']} className="absolute right-0 top-0 z-20 w-full">
        <View className="items-end px-4 pt-2">
          <ThemeToggle variant="onBrandPanel" />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerClassName='grow'
        keyboardShouldPersistTaps='handled'
        keyboardDismissMode='on-drag'
      >
        <AuthBrandPanel />
        <SafeAreaView
          edges={['bottom']}
          className='-mt-16 grow justify-start px-4 pb-16'
        >
          <Card className='w-full max-w-sm self-center rounded-3xl'>
            <CardHeader className='items-center text-lg'>
              <CardTitle className='text-xl'>Entrar na sua conta</CardTitle>
              <CardDescription>
                Acesse sua conta com e-mail e senha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>

          {/* TEMPORÁRIO — atalhos para testar as telas de preview no device.
              Remover antes de mergear: preview-wallet/preview-trading nunca
              devem ser alcançáveis a partir de UI real. */}
          <View className='mt-6 w-full max-w-sm shrink-0 gap-2 self-center'>
            <Link href='/preview-wallet' asChild>
              <Button variant='outline'>
                <Text>Preview: Wallet</Text>
              </Button>
            </Link>
            <Link href='/preview-trading' asChild>
              <Button variant='outline'>
                <Text>Preview: Trading</Text>
              </Button>
            </Link>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
