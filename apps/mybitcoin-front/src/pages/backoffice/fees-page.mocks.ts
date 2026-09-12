import type { GlobalFeeConfig, UserFeeOverride } from '@/types/backoffice-fees'

// Dados mocados — protótipo visual, sem chamada de API real (ver skill brief).

/**
 * Config inicial de `docs/bussiness/08-trades-maker-taker-taxas.md` (seção 4)
 * e `docs/bussiness/09-depositos-e-saques.md` (seção 3.6). Taxas de saque
 * convertidas para satoshi/menor-unidade com 8 casas, mesma convenção do
 * resto do projeto: BTC 0,0002 -> 20000; ETH 0,003 -> 300000;
 * SOL 0,01 -> 1000000; USDT 1 -> 100000000.
 */
export const MOCK_GLOBAL_FEES: GlobalFeeConfig = {
  makerPercent: 0.1,
  takerPercent: 0.2,
  withdrawalFeeSatoshi: {
    BTC: '20000',
    ETH: '300000',
    SOL: '1000000',
    USDT: '100000000',
  },
}

export const MOCK_FEE_OVERRIDES: UserFeeOverride[] = [
  {
    id: 'fee_ov_1',
    userId: 'usr_1',
    userNome: 'Ana Beatriz Souza',
    makerPercent: 0.05,
    takerPercent: 0.1,
    motivo: 'Cliente institucional com alto volume mensal — taxa negociada comercialmente.',
    criadoPor: 'admin.paulo',
    criadoEm: '2026-08-20T14:00:00Z',
  },
  {
    id: 'fee_ov_2',
    userId: 'u_3',
    userNome: 'Fernanda Rocha',
    takerPercent: 0.15,
    motivo: 'Programa de fidelidade — desconto na taxa taker apenas.',
    criadoPor: 'admin.paulo',
    criadoEm: '2026-09-01T09:30:00Z',
  },
  {
    id: 'fee_ov_3',
    userId: 'u_5',
    userNome: 'Juliana Martins',
    makerPercent: 0.08,
    takerPercent: 0.18,
    motivo: 'Parceria de market making — taxas reduzidas para prover liquidez.',
    criadoPor: 'admin.carla',
    criadoEm: '2026-09-05T11:15:00Z',
  },
]
