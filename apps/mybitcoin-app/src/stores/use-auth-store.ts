import { create } from 'zustand';

/**
 * O usuário autenticado vive no cache do TanStack Query (`useCurrentUser`,
 * DATA-001) — esta store nunca guarda dados vindos da API. `kycStatus` é o
 * único estado global cross-screen que ainda não tem uma origem de API própria.
 *
 * Criada nesta tarefa sem consumidor ainda, por decisão explícita do ADR 0001
 * (paridade 1:1 com `../mybitcoin-front`; a tela de KYC é o próximo ADR).
 */
type KycStatus = 'pending' | 'approved' | 'rejected' | null;

interface AuthState {
  kycStatus: KycStatus;
  setKycStatus: (status: KycStatus) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  kycStatus: null,
  setKycStatus: (kycStatus) => set({ kycStatus }),
}));
