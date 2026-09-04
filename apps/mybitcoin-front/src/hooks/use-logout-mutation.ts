import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { authMeQueryKey } from '@/hooks/use-current-user'

/**
 * Logout de sessão única é idempotente na API (OUT-001/003) — mesmo se a
 * chamada falhar, o cache local não deve manter o usuário autenticado
 * (`onSettled`, não `onSuccess`).
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      queryClient.setQueryData(authMeQueryKey, null)
    },
  })
}

export function useLogoutAllMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logoutAll(),
    onSettled: () => {
      queryClient.setQueryData(authMeQueryKey, null)
    },
  })
}
