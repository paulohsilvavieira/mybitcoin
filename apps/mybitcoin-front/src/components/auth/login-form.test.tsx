import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test-utils'
import { LoginForm } from '@/components/auth/login-form'
import { authService } from '@/services/auth.service'
import { authMeQueryKey } from '@/hooks/use-current-user'
import { ApiError } from '@/lib/api-errors'
import type { AuthUser } from '@/types/auth'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ pathname: '/login', state: null }),
  }
})

function buildAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user-1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    status: 'ACTIVE',
    ...overrides,
  }
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    navigateMock.mockReset()
  })

  it('renderiza campos rotulados de e-mail e senha', () => {
    renderWithProviders(<LoginForm />)

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  })

  it('não chama authService.login e mostra erro de validação quando o e-mail é inválido', async () => {
    const loginSpy = vi.spyOn(authService, 'login')

    renderWithProviders(<LoginForm />)
    await userEvent.type(screen.getByLabelText('E-mail'), 'not-an-email')
    await userEvent.type(screen.getByLabelText('Senha'), 'Str0ng!Pass')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(loginSpy).not.toHaveBeenCalled()
  })

  it('não chama authService.login quando a senha está vazia', async () => {
    const loginSpy = vi.spyOn(authService, 'login')

    renderWithProviders(<LoginForm />)
    await userEvent.type(screen.getByLabelText('E-mail'), 'ada@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(loginSpy).not.toHaveBeenCalled()
  })

  it('autentica e popula o cache do TanStack Query com o usuário retornado', async () => {
    vi.spyOn(authService, 'login').mockResolvedValue(buildAuthUser())

    const { queryClient } = renderWithProviders(<LoginForm />)
    await userEvent.type(screen.getByLabelText('E-mail'), 'ada@example.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'Str0ng!Pass')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(queryClient.getQueryData(authMeQueryKey)).toEqual(buildAuthUser())
    })
    expect(authService.login).toHaveBeenCalledWith(
      'ada@example.com',
      'Str0ng!Pass',
    )
  })

  it('redireciona para a rota protegida após autenticar', async () => {
    vi.spyOn(authService, 'login').mockResolvedValue(buildAuthUser())

    renderWithProviders(<LoginForm />)
    await userEvent.type(screen.getByLabelText('E-mail'), 'ada@example.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'Str0ng!Pass')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('exibe mensagem de erro e não popula o cache em credenciais inválidas', async () => {
    vi.spyOn(authService, 'login').mockRejectedValue(
      new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'),
    )

    const { queryClient } = renderWithProviders(<LoginForm />)
    await userEvent.type(screen.getByLabelText('E-mail'), 'ada@example.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'E-mail ou senha inválidos.',
    )
    expect(queryClient.getQueryData(authMeQueryKey)).toBeUndefined()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('exibe mensagem específica quando a conta está suspensa', async () => {
    vi.spyOn(authService, 'login').mockRejectedValue(
      new ApiError(403, 'ACCOUNT_SUSPENDED', 'This account has been suspended'),
    )

    renderWithProviders(<LoginForm />)
    await userEvent.type(screen.getByLabelText('E-mail'), 'ada@example.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'Str0ng!Pass')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sua conta foi suspensa. Entre em contato com o suporte.',
    )
  })

  it('desabilita o botão enquanto a requisição está em andamento', async () => {
    let resolveLogin: (() => void) | undefined
    vi.spyOn(authService, 'login').mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = () => resolve(buildAuthUser())
      }),
    )

    const { queryClient } = renderWithProviders(<LoginForm />)
    await userEvent.type(screen.getByLabelText('E-mail'), 'ada@example.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'Str0ng!Pass')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(
      await screen.findByRole('button', { name: 'Entrando...' }),
    ).toBeDisabled()

    resolveLogin?.()
    await waitFor(() => {
      expect(queryClient.getQueryData(authMeQueryKey)).not.toBeUndefined()
    })
  })
})
