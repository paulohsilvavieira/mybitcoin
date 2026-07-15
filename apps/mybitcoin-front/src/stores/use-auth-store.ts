import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  kycStatus: 'pending' | 'approved' | 'rejected' | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (isLoading: boolean) => void
  setKycStatus: (status: 'pending' | 'approved' | 'rejected' | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  isLoading: true,
  kycStatus: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setKycStatus: (kycStatus) => set({ kycStatus }),
  logout: () => set({ user: null, token: null, kycStatus: null }),
}))
