import type { AdminMember } from '@/types/backoffice-roles'

/** Membros da equipe de backoffice — mock de UI, sem endpoint real. */
export const MOCK_ADMINS: AdminMember[] = [
  {
    id: 'adm-1',
    nome: 'Marina Torres',
    email: 'marina.torres@mybitcoin.com',
    role: 'super_admin',
    ativo: true,
    criadoEm: '2024-02-10T09:00:00.000Z',
  },
  {
    id: 'adm-2',
    nome: 'Diego Ramalho',
    email: 'diego.ramalho@mybitcoin.com',
    role: 'operacao',
    ativo: true,
    criadoEm: '2024-05-22T13:30:00.000Z',
  },
  {
    id: 'adm-3',
    nome: 'Camila Duarte',
    email: 'camila.duarte@mybitcoin.com',
    role: 'financeiro',
    ativo: true,
    criadoEm: '2024-06-14T11:15:00.000Z',
  },
  {
    id: 'adm-4',
    nome: 'Bruno Salgado',
    email: 'bruno.salgado@mybitcoin.com',
    role: 'compliance',
    ativo: true,
    criadoEm: '2024-08-01T16:45:00.000Z',
  },
  {
    id: 'adm-5',
    nome: 'Renata Xavier',
    email: 'renata.xavier@mybitcoin.com',
    role: 'operacao',
    ativo: true,
    criadoEm: '2025-01-09T08:20:00.000Z',
  },
  {
    id: 'adm-6',
    nome: 'Felipe Andrade',
    email: 'felipe.andrade@mybitcoin.com',
    role: 'financeiro',
    ativo: false,
    criadoEm: '2023-11-30T10:00:00.000Z',
  },
]
