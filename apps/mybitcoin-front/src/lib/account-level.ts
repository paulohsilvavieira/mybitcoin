import type { AccountLevel } from '@/types/backoffice'

export const ACCOUNT_LEVELS: AccountLevel[] = ['basico', 'intermediario', 'avancado']

export const ACCOUNT_LEVEL_LABELS: Record<AccountLevel, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}
