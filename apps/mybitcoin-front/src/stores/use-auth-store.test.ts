import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/use-auth-store'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ kycStatus: null })
  })

  it('DATA-001: não guarda dados de usuário/sessão — isso vive no cache do TanStack Query', () => {
    const state = useAuthStore.getState() as unknown as Record<string, unknown>

    expect(state.user).toBeUndefined()
    expect(state.setUser).toBeUndefined()
    expect(state.token).toBeUndefined()
    expect(state.isLoading).toBeUndefined()
  })

  it('armazena e atualiza o kycStatus', () => {
    expect(useAuthStore.getState().kycStatus).toBeNull()

    useAuthStore.getState().setKycStatus('approved')

    expect(useAuthStore.getState().kycStatus).toBe('approved')
  })
})
