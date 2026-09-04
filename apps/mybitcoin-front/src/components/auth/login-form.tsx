import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { loginSchema, type LoginFormData } from '@/types/auth.schema'
import { useLoginMutation } from '@/hooks/use-login-mutation'
import { handleApiError } from '@/lib/api-errors'

interface LocationState {
  from?: { pathname?: string }
}

export function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const loginMutation = useLoginMutation()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo =
    (location.state as LocationState | null)?.from?.pathname ?? '/'

  async function onSubmit(data: LoginFormData) {
    try {
      await loginMutation.mutateAsync(data)
      navigate(redirectTo, { replace: true })
    } catch (caught) {
      setError('root', { message: handleApiError(caught) })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            disabled={loginMutation.isPending}
            {...register('email')}
          />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            disabled={loginMutation.isPending}
            {...register('password')}
          />
          <FieldError errors={errors.password ? [errors.password] : undefined} />
        </Field>

        <FieldError errors={errors.root ? [errors.root] : undefined} />

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
        </Button>
      </FieldGroup>
    </form>
  )
}
