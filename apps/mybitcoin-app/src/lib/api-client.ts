import axios, { type AxiosError } from 'axios';

import { ApiError, parseApiError } from '@/lib/api-errors';
import { readCsrfToken } from '@/lib/cookies';

/**
 * Convenção Expo para env pública (inlined em build time), equivalente ao
 * `VITE_API_URL` do `../mybitcoin-front`. Ver `.env.example`.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

/**
 * Instância Axios para a API mybitcoin.
 *
 * `withCredentials: true` é obrigatório: a sessão vive nos cookies
 * `__Host-session` (httpOnly) / `__Host-csrf`, nunca em memória ou storage.
 * No nativo, quem persiste esses cookies é o cookie jar do stack de rede do RN.
 *
 * `timeout`: sem isso, `RootNavigator` (`app/_layout.tsx`) fica com a tela em
 * branco enquanto `GET /auth/me` não resolve — sem limite, uma rede instável
 * no boot trava o app indefinidamente antes até do login aparecer. Com o
 * timeout, o erro vira `ApiError(0, 'NETWORK_ERROR', ...)` (ver interceptor de
 * response abaixo), tratado com mensagem em pt-BR por `handleApiError`.
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 8000,
});

apiClient.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  if (method && MUTATING_METHODS.has(method)) {
    const csrfToken = await readCsrfToken(API_URL);
    if (csrfToken) {
      config.headers.set('X-CSRF-Token', csrfToken);
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const body = error.response.data;
      return Promise.reject(
        parseApiError({
          statusCode: error.response.status,
          ...(body && typeof body === 'object' ? body : {}),
        })
      );
    }
    if (error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }
    return Promise.reject(new ApiError(0, 'NETWORK_ERROR', error.message));
  }
);
