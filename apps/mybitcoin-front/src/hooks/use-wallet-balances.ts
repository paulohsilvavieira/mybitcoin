import { useQuery } from '@tanstack/react-query'
import { walletService } from '@/services/wallet.service'

/** Chave de cache dos saldos por ativo — única fonte de verdade (DATA-001). */
export const walletBalancesQueryKey = ['wallet-balances'] as const

export function useWalletBalances() {
  return useQuery({
    queryKey: walletBalancesQueryKey,
    queryFn: ({ signal }) => walletService.getBalances(signal),
    staleTime: 30_000,
  })
}
