# Status de Implementação vs docs/bussiness/

> Comparação entre as regras de negócio documentadas em `docs/bussiness/` e o código real do monorepo (foco em `apps/mybitcoin-api`, fonte de verdade do domínio). Gerado em 2026-09-12.

## Resumo Executivo

| Área | % Completo | Status |
|---|---|---|
| 1. Identidade e Acesso | ~55% | ⚠️ Parcial |
| 2. Modelo de Domínio | ~20% | ⚠️ Parcial |
| 3. Carteiras e Ledger | ~35% | ⚠️ Parcial |
| 4. Mercados de Negociação | 0% | ❌ Não implementado |
| 5. Order Book | 0% | ❌ Não implementado |
| 6. Matching Engine | 0% | ❌ Não implementado |
| 7. Trades/Maker-Taker/Taxas | 0% | ❌ Não implementado |
| 8. Depósitos e Saques | ~25% | ⚠️ Parcial |
| 9. Eventos de Domínio e Auditoria | ~20% | ⚠️ Parcial |
| 10. Invariantes Globais | ~35% | ⚠️ Parcial |
| 11. Cenários BDD | 15/60 cenários | ⚠️ Parcial |

## Detalhe por área

### 1. Identidade e acesso (`docs/bussiness/02`)
Evidência: `apps/mybitcoin-api/src/modules/identity/`

- ✅ Completo: cadastro (`register-user.usecase.ts` + spec), login (`login.usecase.ts` + spec, bloqueio por tentativas em `login-lockout-policy.ts`), logout, sessões (`session.entity.ts`, `session-auth.guard.ts`, cookie httpOnly — ADR 0004/0005)
- ❌ Não implementado: recuperação de senha, verificação de e-mail (token é gerado mas nunca persistido/validado — conta nunca sai de `PENDING_EMAIL_VERIFICATION`), KYC básico, MFA/2FA

### 2. Modelo de domínio (`03`)
O próprio doc já foi atualizado (commit `c91191a`) com tabela de status.

- ✅ `User` (parcial, sem `username`), `LedgerEntry` (schema simplificado: `account` string livre, sem `walletId`/`balanceBefore/After`)
- ⚠️ `Deposit` — não existe como entidade própria, vira `Transaction` genérico
- ❌ `Wallet`, `Balance`, `Market`, `Order`, `Trade`, `Withdrawal` — nenhuma entidade existe

### 3. Carteiras e Ledger (`04`)
Evidência: `financial/domain/entities/`

- ✅ Ledger imutável de dupla entrada (`ledger-entry.entity.ts`, `transaction.entity.ts`), `UnitOfWork` para atomicidade
- ⚠️ Saldo é derivado do ledger, sem entidade `Wallet`/`Balance` e sem endpoint de consulta de saldo

### 4-6. Mercados, Order Book, Matching Engine (`05`, `06`, `07`)
❌ 0%. Nenhum diretório/módulo `market`, `order` ou `matching` existe em `src/modules/`.

### 7. Trades/Maker-Taker/Taxas (`08`)
❌ 0%, depende do matching engine inexistente.

### 8. Depósitos e Saques (`09`)
Evidência: `financial/application/confirm-deposit.usecase.ts` + controller `POST /financial/deposit/confirm`

- ⚠️ Só a confirmação (n confirmações on-chain → ledger) existe; criação/monitoramento do depósito e todo o fluxo de saque (0%) não existem

### 9. Eventos e Auditoria (`10`)
Doc já marca como "arquitetura-alvo": eventos reais só em `identity/domain/events/` (notificações pontuais); Event Sourcing/Event Store/Replay são desenho futuro, código morto identificado.

### 10. Invariantes Globais (`11`)
Tabela do doc: GLOB-001/003/005/012/018/019/020 (saldo não-negativo, conservação, imutabilidade, IDs únicos, ledger balanceado) ✅ aplicáveis hoje; as ligadas a ordens/trades/matching (GLOB-002, 006-011, 014-017) são N/A por falta do módulo correspondente.

### 11. Cenários BDD (`12`)
De 60 cenários: Usuários (1-8) majoritariamente ✅ exceto bloqueio; Wallets/Depósitos (9-21) ⚠️; Saques a Trades (22-60, 39 cenários) ❌.

## Observação de escopo

`git status` mostra trabalho em progresso não commitado em `apps/mybitcoin-app` e `apps/mybitcoin-front` (componentes de `trading/`, `market/`, `wallet/transaction-history.tsx`) — isso é UI mobile/web sendo construída antes do backend correspondente existir; não altera a avaliação acima, que é sobre o backend (`mybitcoin-api`), fonte de verdade do domínio.
