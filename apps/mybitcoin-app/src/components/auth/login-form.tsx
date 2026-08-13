import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLoginMutation } from '@/hooks/use-login-mutation';
import { handleApiError } from '@/lib/api-errors';
import { ICON_MUTED_FOREGROUND } from '@/lib/icon-colors';
import { loginSchema, type LoginFormData } from '@/types/auth.schema';

export function LoginForm() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = useLoginMutation();
  const isPending = loginMutation.isPending;
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();
  const iconColor =
    ICON_MUTED_FOREGROUND[colorScheme === 'dark' ? 'dark' : 'light'];

  async function onSubmit(data: LoginFormData) {
    try {
      await loginMutation.mutateAsync(data);
    } catch (caught) {
      setError('root', { message: handleApiError(caught) });
    }
  }

  return (
    <View className='gap-6'>
      <View className='gap-2'>
        <Label nativeID='login-email-label' className='text-lg'>
          E-mail
        </Label>
        <Controller
          control={control}
          name='email'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              aria-labelledby='login-email-label'
              autoCapitalize='none'
              autoComplete='email'
              autoCorrect={false}
              editable={!isPending}
              inputMode='email'
              className='h-12 text-lg'
              keyboardType='email-address'
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              {...(errors.email ? { 'aria-invalid': true } : {})}
            />
          )}
        />
        {errors.email ? (
          <Text className='text-destructive text-sm'>
            {errors.email.message}
          </Text>
        ) : null}
      </View>

      <View className='gap-2'>
        <Label nativeID='login-password-label' className='text-lg'>
          Senha
        </Label>
        <Controller
          control={control}
          name='password'
          render={({ field: { onChange, onBlur, value } }) => (
            <View className='relative justify-center'>
              <Input
                aria-labelledby='login-password-label'
                autoCapitalize='none'
                autoComplete='current-password'
                autoCorrect={false}
                editable={!isPending}
                className='h-12 pr-12 text-lg'
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={handleSubmit(onSubmit)}
                returnKeyType='go'
                secureTextEntry={!showPassword}
                value={value}
                {...(errors.password ? { 'aria-invalid': true } : {})}
              />
              <Pressable
                accessibilityRole='button'
                accessibilityLabel={
                  showPassword ? 'Ocultar senha' : 'Mostrar senha'
                }
                disabled={isPending}
                hitSlop={8}
                onPress={() => setShowPassword((current) => !current)}
                className='absolute right-3'
              >
                {showPassword ? (
                  <EyeOff size={18} color={iconColor} />
                ) : (
                  <Eye size={18} color={iconColor} />
                )}
              </Pressable>
            </View>
          )}
        />
        {errors.password ? (
          <Text className='text-destructive text-md'>
            {errors.password.message}
          </Text>
        ) : null}
      </View>

      {errors.root ? (
        <Text className='text-destructive text-md'>{errors.root.message}</Text>
      ) : null}

      <Button
        className='h-14 w-full'
        disabled={isPending}
        onPress={handleSubmit(onSubmit)}
        size='lg'
      >
        <Text className='text-lg'>{isPending ? 'Entrando...' : 'Entrar'}</Text>
      </Button>
    </View>
  );
}
