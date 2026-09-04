import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test-utils'
import { BalanceList } from '@/components/wallet/balance-list'
import { walletService } from '@/services/wallet.service'
import { ApiError } from '@/lib/api-errors'
import type { Balance } from '@/types/wallet'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

function buildBalance(overrides: Partial<Balance> = {}): Balance {
  return {
    asset: 'BTC',
    available: '150000',
    locked: '0',
    total: '150000',
    ...overrides,
  }
}

describe('BalanceList', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    navigateMock.mockReset()
  })

  it('mostra o skeleton enquanto carrega', () => {
    vi.spyOn(walletService, 'getBalances').mockReturnValue(new Promise(() => {}))

    renderWithProviders(<BalanceList />)

    expect(screen.getAllByText('', { selector: '[data-slot=skeleton]' }).length).toBeGreaterThan(0)
  })

  it('exibe os saldos por ativo quando a requisição é bem-sucedida', async () => {
    vi.spyOn(walletService, 'getBalances').mockResolvedValue([
      buildBalance({ asset: 'BTC', available: '150000', locked: '0', total: '150000' }),
    ])

    renderWithProviders(<BalanceList />)

    expect(await screen.findByText('Bitcoin')).toBeInTheDocument()
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('0.00150000 BTC')).toBeInTheDocument()
    expect(screen.queryByText(/bloqueado/)).not.toBeInTheDocument()
  })

  it('mostra o saldo bloqueado só quando há algo bloqueado', async () => {
    vi.spyOn(walletService, 'getBalances').mockResolvedValue([
      buildBalance({ asset: 'BTC', available: '150000', locked: '50000', total: '200000' }),
    ])

    renderWithProviders(<BalanceList />)

    expect(await screen.findByText('0.00150000 BTC')).toBeInTheDocument()
    expect(screen.getByText('0.00050000 BTC bloqueado')).toBeInTheDocument()
  })

  it('mostra estado vazio quando não há nenhum ativo movimentado', async () => {
    vi.spyOn(walletService, 'getBalances').mockResolvedValue([])

    renderWithProviders(<BalanceList />)

    expect(await screen.findByText('Nenhum saldo ainda')).toBeInTheDocument()
  })

  it('mostra mensagem de erro amigável em falha genérica', async () => {
    vi.spyOn(walletService, 'getBalances').mockRejectedValue(
      new ApiError(500, 'INTERNAL_ERROR', 'Internal error'),
    )

    renderWithProviders(<BalanceList />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Erro interno. Tente novamente.',
    )
    expect(screen.queryByRole('button', { name: 'Ir para o login' })).not.toBeInTheDocument()
  })

  it('mostra opção de ir para login quando a sessão expirou (401)', async () => {
    vi.spyOn(walletService, 'getBalances').mockRejectedValue(
      new ApiError(401, 'UNAUTHORIZED', 'Unauthorized'),
    )

    renderWithProviders(<BalanceList />)

    const loginButton = await screen.findByRole('button', { name: 'Ir para o login' })
    loginButton.click()

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login', { replace: true })
    })
  })
})
