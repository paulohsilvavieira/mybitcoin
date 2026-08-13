import { apiClient } from '@/lib/api-client';
import type { AuthUser, LoginResponse, MeResponse } from '@/types/auth';

function fromLoginResponse(response: LoginResponse): AuthUser {
  return {
    id: response.userId,
    name: response.name,
    email: response.email,
    status: response.status,
  };
}

export const authService = {
  /** Autentica e faz a API definir os cookies `__Host-session`/`__Host-csrf`. */
  async login(email: string, password: string): Promise<AuthUser> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return fromLoginResponse(data);
  },

  /** Idempotente na API: nunca falha por sessão ausente ou já expirada. */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  /** Revoga todas as sessões do usuário. Exige sessão válida (401 caso contrário). */
  async logoutAll(): Promise<void> {
    await apiClient.post('/auth/logout-all');
  },

  /** Restaura o usuário da sessão em curso; lança ApiError 401 se não houver. */
  async getMe(signal?: AbortSignal): Promise<AuthUser> {
    const { data } = await apiClient.get<MeResponse>('/auth/me', { signal });
    return data;
  },
};
