import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTestQueryClient } from '@/test-utils'
import { useCurrentUser } from '@/hooks/use-current-user'
import { authService } from '@/services/auth.service'
import { ApiError } from '@/lib/api-errors'

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCurrentUser', () => {
  it('retorna o usuário da sessão em curso', async () => {
    vi.spyOn(authService, 'getMe').mockResolvedValue({
      id: 'user-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      status: 'ACTIVE',
    })

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => {
      expect(result.current.data).toEqual({
        id: 'user-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        status: 'ACTIVE',
      })
    })
  })

  it('mantém data undefined quando não há sessão (401), sem retry', async () => {
    const spy = vi
      .spyOn(authService, 'getMe')
      .mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', 'Unauthorized'))

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    expect(result.current.data).toBeUndefined()
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
