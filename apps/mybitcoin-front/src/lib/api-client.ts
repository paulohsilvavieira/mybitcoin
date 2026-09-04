import axios, { type AxiosError } from 'axios'
import { ApiError, parseApiError } from '@/lib/api-errors'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

/** Cookie CSRF definido pela API no login (não-httpOnly, por design do ADR 0004). */
const CSRF_COOKIE_NAME = '__Host-csrf'

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete'])

export function readCsrfToken(): string | null {
  const match = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${CSRF_COOKIE_NAME}=`))
  if (!match) return null
  return decodeURIComponent(match.slice(CSRF_COOKIE_NAME.length + 1)) || null
}

/**
 * Instância Axios para a API mybitcoin.
 *
 * `withCredentials: true` é obrigatório: a sessão vive nos cookies
 * `__Host-session` (httpOnly) / `__Host-csrf`, nunca em memória ou storage.
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase()
  if (method && MUTATING_METHODS.has(method)) {
    const csrfToken = readCsrfToken()
    if (csrfToken) {
      config.headers.set('X-CSRF-Token', csrfToken)
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const body = error.response.data
      return Promise.reject(
        parseApiError({
          statusCode: error.response.status,
          ...(body && typeof body === 'object' ? body : {}),
        }),
      )
    }
    if (error.code === 'ERR_CANCELED') {
      return Promise.reject(error)
    }
    return Promise.reject(new ApiError(0, 'NETWORK_ERROR', error.message))
  },
)
