import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useLogoutAllMutation,
  useLogoutMutation,
} from '@/hooks/use-logout-mutation'
import { authMeQueryKey } from '@/hooks/use-current-user'
import { authService } from '@/services/auth.service'

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

const seededUser = {
  id: 'user-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  status: 'ACTIVE' as const,
}

describe('useLogoutMutation', () => {
  it('limpa o cache de auth/me após logout bem-sucedido', async () => {
    vi.spyOn(authService, 'logout').mockResolvedValue(undefined)
    const queryClient = new QueryClient()
    queryClient.setQueryData(authMeQueryKey, seededUser)

    const { result } = renderHook(() => useLogoutMutation(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync()
    })

    await waitFor(() => {
      expect(queryClient.getQueryData(authMeQueryKey)).toBeNull()
    })
  })

  it('OUT-001/003: limpa o cache mesmo quando a chamada falha (idempotência)', async () => {
    vi.spyOn(authService, 'logout').mockRejectedValue(new Error('network'))
    const queryClient = new QueryClient()
    queryClient.setQueryData(authMeQueryKey, seededUser)

    const { result } = renderHook(() => useLogoutMutation(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync().catch(() => undefined)
    })

    await waitFor(() => {
      expect(queryClient.getQueryData(authMeQueryKey)).toBeNull()
    })
  })
})

describe('useLogoutAllMutation', () => {
  it('limpa o cache de auth/me após revogar todas as sessões', async () => {
    vi.spyOn(authService, 'logoutAll').mockResolvedValue(undefined)
    const queryClient = new QueryClient()
    queryClient.setQueryData(authMeQueryKey, seededUser)

    const { result } = renderHook(() => useLogoutAllMutation(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync()
    })

    await waitFor(() => {
      expect(queryClient.getQueryData(authMeQueryKey)).toBeNull()
    })
  })

  it('OUT-002: limpa o cache mesmo quando a chamada falha (idempotência)', async () => {
    vi.spyOn(authService, 'logoutAll').mockRejectedValue(new Error('network'))
    const queryClient = new QueryClient()
    queryClient.setQueryData(authMeQueryKey, seededUser)

    const { result } = renderHook(() => useLogoutAllMutation(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync().catch(() => undefined)
    })

    await waitFor(() => {
      expect(queryClient.getQueryData(authMeQueryKey)).toBeNull()
    })
  })
})
