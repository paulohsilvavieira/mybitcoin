import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { authMeQueryKey } from '@/hooks/use-current-user'

interface LoginInput {
  email: string
  password: string
}

/** Login popula direto o cache de `['auth','me']` — evita um GET /auth/me redundante. */
export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: LoginInput) =>
      authService.login(email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(authMeQueryKey, user)
    },
  })
}
