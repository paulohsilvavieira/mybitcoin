/**
 * Invariantes do Frontend — equivalentes ao INV-xxx do backend.
 * VIOLAÇÃO = BUG. Sem exceção.
 *
 * FIN-001: Valores monetários NUNCA são convertidos para number em componente, hook ou utilitário
 * FIN-002: formatSatoshi() é o ÚNICO caminho para exibir valores satoshi
 * FIN-003: Nenhuma chamada API financeira sem verificar auth + KYC status
 *
 * UI-001: Toda página trata loading, error e empty states
 * UI-002: Touch targets em elementos interativos são mínimo 44px
 * UI-003: Todo input tem <Label> associado com htmlFor
 * UI-004: Nenhum componente excede 150 linhas (extrair ou dividir)
 *
 * DATA-001: Dados da API vivem APENAS no cache do TanStack Query
 * DATA-002: Zustand armazena APENAS estado global cross-page
 * DATA-003: Estado local usa useState — NUNCA Zustand
 * DATA-004: Nenhum dado sensível (senha, token, chave privada) é armazenado em state persistente
 *
 * SEC-001: Nenhum conteúdo dinâmico é renderizado sem sanitização (XSS)
 * SEC-002: Tokens de auth vivem em httpOnly cookies ou memory — NUNCA em localStorage
 * SEC-003: Valores monetários nunca interpolados em URLs ou logs do client
 */

export const FRONTEND_INVARIANTS = {
  FINANCIAL: {
    FIN_001: 'Valores monetários NUNCA são convertidos para number em componente, hook ou utilitário',
    FIN_002: 'formatSatoshi() é o ÚNICO caminho para exibir valores satoshi',
    FIN_003: 'Nenhuma chamada API financeira sem verificar auth + KYC status',
  },
  UI: {
    UI_001: 'Toda página trata loading, error e empty states',
    UI_002: 'Touch targets em elementos interativos são mínimo 44px',
    UI_003: 'Todo input tem <Label> associado com htmlFor',
    UI_004: 'Nenhum componente excede 150 linhas (extrair ou dividir)',
  },
  DATA: {
    DATA_001: 'Dados da API vivem APENAS no cache do TanStack Query',
    DATA_002: 'Zustand armazena APENAS estado global cross-page',
    DATA_003: 'Estado local usa useState — NUNCA Zustand',
    DATA_004: 'Nenhum dado sensível é armazenado em state persistente',
  },
  SECURITY: {
    SEC_001: 'Nenhum conteúdo dinâmico é renderizado sem sanitização (XSS)',
    SEC_002: 'Tokens de auth vivem em httpOnly cookies ou memory — NUNCA em localStorage',
    SEC_003: 'Valores monetários nunca interpolados em URLs ou logs do client',
  },
} as const
