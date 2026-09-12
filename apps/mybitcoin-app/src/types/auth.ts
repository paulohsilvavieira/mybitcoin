export type UserStatus = 'PENDING_EMAIL_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';

/** Espelha `kycStatus` de `use-auth-store.ts` do `../mybitcoin-front` — `null` é "não iniciado". */
export type KycStatus = 'pending' | 'approved' | 'rejected' | null;

/** Formato normalizado do usuário autenticado, usado no cache do TanStack Query (DATA-001). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
}

/** Resposta de `POST /auth/login`. */
export interface LoginResponse {
  userId: string;
  name: string;
  email: string;
  status: UserStatus;
}

/** Resposta de `GET /auth/me`. */
export interface MeResponse {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
}
