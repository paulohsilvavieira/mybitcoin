import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'

/** Chave de cache do usuário autenticado — única fonte de verdade (DATA-001). */
export const authMeQueryKey = ['auth', 'me'] as const

/**
 * O cookie de sessão é httpOnly e opaco ao JavaScript, então `GET /auth/me` é
 * a única forma de saber quem está autenticado. 401 (sem sessão) deixa
 * `data` como `undefined` — não é reexecutado (retry: false).
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authMeQueryKey,
    queryFn: ({ signal }) => authService.getMe(signal),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
