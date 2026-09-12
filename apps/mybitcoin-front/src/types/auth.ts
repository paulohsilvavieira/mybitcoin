export type UserStatus =
  | 'PENDING_EMAIL_VERIFICATION'
  | 'ACTIVE'
  | 'SUSPENDED'

/** Status de verificação KYC — ainda sem endpoint dedicado na API (mock de UI). */
export type KycStatus = 'VERIFIED' | 'PENDING' | 'REJECTED' | 'NOT_STARTED'

/** Formato normalizado do usuário autenticado, usado no cache do TanStack Query (DATA-001). */
export interface AuthUser {
  id: string
  name: string
  email: string
  status: UserStatus
}

/** Resposta de `POST /auth/login`. */
export interface LoginResponse {
  userId: string
  name: string
  email: string
  status: UserStatus
}

/** Resposta de `GET /auth/me`. */
export interface MeResponse {
  id: string
  name: string
  email: string
  status: UserStatus
}
