import { create } from 'zustand'

/**
 * O usuário autenticado vive no cache do TanStack Query (`useCurrentUser`,
 * DATA-001) — esta store nunca guarda dados vindos da API. `kycStatus` é o
 * único estado global cross-page que ainda não tem uma origem de API própria.
 */
interface AuthState {
  kycStatus: 'pending' | 'approved' | 'rejected' | null
  setKycStatus: (status: 'pending' | 'approved' | 'rejected' | null) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  kycStatus: null,
  setKycStatus: (kycStatus) => set({ kycStatus }),
}))
