import { apiClient } from '@/lib/api-client'
import type { Balance } from '@/types/wallet'

export const walletService = {
  /** Lista os saldos por ativo do usuário autenticado. Exige sessão válida (401 caso contrário). */
  async getBalances(signal?: AbortSignal): Promise<Balance[]> {
    const { data } = await apiClient.get<Balance[]>('/financial/balances', { signal })
    return data
  },
}
