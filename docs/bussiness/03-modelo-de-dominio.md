# Modelo de Domínio

## Status de Implementação

Este documento descreve o **modelo-alvo** do domínio, nem tudo aqui já existe no código. Estado real em `src/modules/` nesta data:

| Entidade      | Status                | Onde está no código                                                                |
| ------------- | ---------------------- | ----------------------------------------------------------------------------------- |
| User          | ✅ Implementado (parcial) | `identity/domain/entities/user.entity.ts` — sem `username`, status difere (ver abaixo) |
| Wallet        | ⚠️ Não existe como entidade | saldo hoje é derivado de `LedgerEntry`/`Transaction` no módulo `financial/`      |
| Balance       | ❌ Planejado            | não existe entidade `Balance`; será modelado quando o saldo deixar de ser só derivado |
| LedgerEntry   | ✅ Implementado (schema diferente) | `financial/domain/entities/ledger-entry.entity.ts` — campos reais: `account` (string), `type: 'debit'\|'credit'`, `amountSatoshi: bigint`, sem `balanceBefore`/`balanceAfter`/`referenceType` |
| Market        | ❌ Planejado            | módulo de mercados ainda não existe                                                 |
| Order / Trade | ❌ Planejado            | matching engine ainda não existe                                                    |
| Deposit       | ⚠️ Parcial              | fluxo de confirmação existe (`financial/application/confirm-deposit*.usecase.ts`), sem entidade `Deposit` própria — vira `Transaction` |
| Withdrawal    | ❌ Planejado            | saques ainda não implementados                                                      |

Onde este documento diverge do código real hoje, o código é a fonte de verdade — trate as seções abaixo como desenho de arquitetura de domínio, não como schema já implementado.

## Visão Geral

O modelo de domínio representa os principais conceitos de negócio da Exchange Spot, suas responsabilidades, relacionamentos e regras invariantes.

```text
User
 ├── Wallet
 │     ├── Balance
 │     └── LedgerEntry
 │
 ├── Order
 │     └── Trade
 │
 ├── Deposit
 │
 └── Withdrawal

Market
 ├── Order
 └── Trade
```

---

# User ✅ Implementado (parcial)

## Responsabilidade

Representa um participante da exchange responsável por realizar operações de depósito, negociação e retirada de ativos.

## Campos

| Campo     | Tipo      | Descrição           |
| --------- | --------- | ------------------- |
| id        | UUID      | Identificador único |
| email     | String    | E-mail do usuário   |
| username  | String    | Nome de usuário     |
| status    | Enum      | Status da conta     |
| createdAt | Timestamp | Data de criação     |
| updatedAt | Timestamp | Data de atualização |

### Status

Valores reais, de `identity/domain/value-objects/user-status.vo.ts`:

| Valor                        |
| ----------------------------- |
| PENDING_EMAIL_VERIFICATION    |
| ACTIVE                        |
| SUSPENDED                     |

`BLOCKED` não existe hoje — se for adicionado, deve nascer neste value object primeiro.

## Relacionamentos

| Relacionamento    | Cardinalidade |
| ----------------- | ------------- |
| User → Wallet     | 1 : 1         |
| User → Order      | 1 : N         |
| User → Deposit    | 1 : N         |
| User → Withdrawal | 1 : N         |

## Invariantes

| ID       | Regra                                 |
| -------- | -------------------------------------- |
| MOD-001  | E-mail deve ser único                 |
| MOD-002  | Username deve ser único               |
| MOD-003  | Usuário bloqueado não pode negociar   |
| MOD-004  | Usuário deve possuir Wallet associada |

---

# Wallet ⚠️ Não existe como entidade

## Responsabilidade

Representa a carteira de ativos pertencente ao usuário.

## Campos

| Campo     | Tipo      | Descrição |
| --------- | --------- | --------- |
| id        | UUID      |           |
| userId    | UUID      |           |
| createdAt | Timestamp |           |
| updatedAt | Timestamp |           |

## Relacionamentos

| Relacionamento       | Cardinalidade |
| -------------------- | ------------- |
| Wallet → User        | N : 1         |
| Wallet → Balance     | 1 : N         |
| Wallet → LedgerEntry | 1 : N         |

## Invariantes

| ID      | Regra                                    |
| ------- | ------------------------------------------ |
| MOD-005 | Cada usuário possui apenas uma Wallet    |
| MOD-006 | Wallet não pode existir sem User         |
| MOD-007 | Toda movimentação deve gerar LedgerEntry — mesma regra de INV-005 em `04-carteiras-e-ledger-financeiro.md` |

---

# Balance ❌ Planejado

## Responsabilidade

Representa o saldo de um determinado ativo dentro da carteira.

## Campos

| Campo           | Tipo      | Descrição                                                        |
| --------------- | --------- | ----------------------------------------------------------------- |
| id              | UUID      |                                                                     |
| walletId        | UUID      |                                                                     |
| asset           | String    |                                                                     |
| availableAmount | bigint    | satoshi (ou menor unidade do ativo) — nunca `Decimal`/`number`, ver CLAUDE.md |
| lockedAmount    | bigint    | satoshi (ou menor unidade do ativo) — nunca `Decimal`/`number`     |
| updatedAt       | Timestamp |                                                                     |

## Relacionamentos

| Relacionamento   | Cardinalidade |
| ---------------- | ------------- |
| Balance → Wallet | N : 1         |

## Invariantes

| ID      | Regra                                                         |
| ------- | ---------------------------------------------------------------- |
| MOD-008 | availableAmount >= 0 — mesma regra de INV-001                |
| MOD-009 | lockedAmount >= 0 — mesma regra de INV-002                   |
| MOD-010 | asset deve existir no catálogo de ativos                      |
| MOD-011 | Total = availableAmount + lockedAmount — mesma regra de INV-004 |
| MOD-012 | Não pode existir mais de um Balance por ativo na mesma Wallet |

## Exemplo

| Ativo | Disponível | Bloqueado |
| ----- | ---------- | --------- |
| BTC   | 0.5        | 0.1       |

Total BTC:

```text
0.6 BTC
```

---

# Market ❌ Planejado

## Responsabilidade

Representa um par de negociação disponível na exchange.

## Campos

| Campo             | Tipo      |
| ----------------- | --------- |
| id                | UUID      |
| symbol            | String    |
| baseAsset         | String    |
| quoteAsset        | String    |
| status            | Enum      |
| pricePrecision    | Integer   |
| quantityPrecision | Integer   |
| createdAt         | Timestamp |

## Relacionamentos

| Relacionamento | Cardinalidade |
| -------------- | ------------- |
| Market → Order | 1 : N         |
| Market → Trade | 1 : N         |

## Invariantes

| ID      | Regra                                   |
| ------- | ----------------------------------------- |
| MOD-013 | baseAsset ≠ quoteAsset                  |
| MOD-014 | Symbol deve ser único                   |
| MOD-015 | Mercado inativo não aceita novas ordens |

### Exemplo

| Symbol   |
| -------- |
| BTC/BRL  |
| BTC/USDT |
| ETH/BRL  |

---

# Order ❌ Planejado

## Responsabilidade

Representa uma intenção de compra ou venda enviada ao mercado.

## Campos

| Campo             | Tipo      |
| ----------------- | --------- |
| id                | UUID      |
| userId            | UUID      |
| marketId          | UUID      |
| side              | Enum      |
| type              | Enum      |
| status            | Enum      |
| price             | Decimal   |
| quantity          | Decimal   |
| filledQuantity    | Decimal   |
| remainingQuantity | Decimal   |
| createdAt         | Timestamp |
| updatedAt         | Timestamp |

### Side

| Valor |
| ----- |
| BUY   |
| SELL  |

### Type

| Valor  |
| ------ |
| MARKET |
| LIMIT  |

### Status

| Valor            |
| ---------------- |
| OPEN             |
| PARTIALLY_FILLED |
| FILLED           |
| CANCELLED        |

## Relacionamentos

| Relacionamento | Cardinalidade |
| -------------- | ------------- |
| Order → User   | N : 1         |
| Order → Market | N : 1         |
| Order → Trade  | 1 : N         |

## Invariantes

| ID      | Regra                                         |
| ------- | ------------------------------------------------ |
| MOD-016 | quantity > 0                                  |
| MOD-017 | filledQuantity >= 0                           |
| MOD-018 | remainingQuantity >= 0                        |
| MOD-019 | filledQuantity ≤ quantity                     |
| MOD-020 | quantity = filledQuantity + remainingQuantity |
| MOD-021 | Ordem FILLED não pode ser alterada            |
| MOD-022 | Ordem CANCELLED não pode voltar para OPEN — mesma regra de GLOB-009 |

---

# Trade ❌ Planejado

## Responsabilidade

Representa uma execução realizada pelo Matching Engine.

## Campos

| Campo       | Tipo      |
| ----------- | --------- |
| id          | UUID      |
| marketId    | UUID      |
| buyOrderId  | UUID      |
| sellOrderId | UUID      |
| price       | Decimal   |
| quantity    | Decimal   |
| executedAt  | Timestamp |

## Relacionamentos

| Relacionamento | Cardinalidade |
| -------------- | ------------- |
| Trade → Market | N : 1         |
| Trade → Order  | N : 1         |

## Invariantes

| ID      | Regra                         |
| ------- | -------------------------------- |
| MOD-023 | quantity > 0                  |
| MOD-024 | price > 0                     |
| MOD-025 | buyOrderId ≠ sellOrderId      |
| MOD-026 | Trade é imutável após criação — mesma regra de GLOB-011 |

## Exemplo

| Campo      | Valor   |
| ---------- | ------- |
| Mercado    | BTC/BRL |
| Quantidade | 0.25    |
| Preço      | 500.000 |

---

# Deposit ⚠️ Parcial

## Responsabilidade

Representa uma entrada de recursos na conta do usuário.

## Campos

| Campo       | Tipo      |
| ----------- | --------- |
| id          | UUID      |
| userId      | UUID      |
| asset       | String    |
| amount      | Decimal   |
| status      | Enum      |
| createdAt   | Timestamp |
| completedAt | Timestamp |

### Status

| Valor     |
| --------- |
| PENDING   |
| COMPLETED |
| FAILED    |
| CANCELLED |

## Relacionamentos

| Relacionamento | Cardinalidade |
| -------------- | ------------- |
| Deposit → User | N : 1         |

## Invariantes

| ID      | Regra                                     |
| ------- | -------------------------------------------- |
| MOD-027 | amount > 0                                |
| MOD-028 | Depósito COMPLETED não pode ser alterado  |
| MOD-029 | Depósito COMPLETED deve gerar LedgerEntry — mesma regra de INV-005 |
| MOD-030 | Asset deve ser suportado pela exchange    |

---

# Withdrawal ❌ Planejado

## Responsabilidade

Representa uma saída de recursos da conta do usuário.

## Campos

| Campo       | Tipo      |
| ----------- | --------- |
| id          | UUID      |
| userId      | UUID      |
| asset       | String    |
| amount      | Decimal   |
| fee         | Decimal   |
| status      | Enum      |
| createdAt   | Timestamp |
| completedAt | Timestamp |

### Status

| Valor      |
| ---------- |
| PENDING    |
| PROCESSING |
| COMPLETED  |
| FAILED     |
| CANCELLED  |

## Relacionamentos

| Relacionamento    | Cardinalidade |
| ----------------- | ------------- |
| Withdrawal → User | N : 1         |

## Invariantes

| ID      | Regra                                       |
| ------- | ----------------------------------------------- |
| MOD-031 | amount > 0                                  |
| MOD-032 | fee >= 0                                    |
| MOD-033 | Usuário deve possuir saldo suficiente       |
| MOD-034 | Withdrawal COMPLETED é imutável             |
| MOD-035 | Withdrawal COMPLETED deve gerar LedgerEntry — mesma regra de INV-005 |

---

# LedgerEntry ✅ Implementado (schema diferente do modelo-alvo)

## Responsabilidade

Representa o registro contábil imutável de todas as movimentações financeiras da plataforma.

O Ledger é a fonte oficial da verdade financeira da Exchange.

## Campos

Este é o modelo-alvo (com `walletId`, `balanceBefore/After`, `referenceType`). O schema **real**, em `financial/domain/entities/ledger-entry.entity.ts`, é mais simples hoje:

| Campo         | Tipo               | No modelo-alvo (acima) | Real hoje |
| ------------- | ------------------ | ----------------------- | --------- |
| id            | UUID                | ✅ | ✅ |
| transactionId | UUID                | — | ✅ (`transactionId`, não `referenceId`) |
| account       | String              | — | ✅ (string livre, ex. `USER:1001:BTC`, não `walletId`) |
| type          | `'debit' \| 'credit'` | `entryType` (4 valores) | ✅ só `debit`/`credit` — sem `LOCK`/`UNLOCK` |
| amountSatoshi | bigint              | `amount: Decimal`       | ✅ bigint, nunca Decimal |
| createdAt     | Timestamp           | ✅ | ✅ |
| walletId      | UUID                | ✅ | ❌ não existe |
| balanceBefore | Decimal             | ✅ | ❌ não existe |
| balanceAfter  | Decimal             | ✅ | ❌ não existe |
| referenceType | Enum                | ✅ | ❌ não existe |

### EntryType (modelo-alvo)

| Valor  |
| ------ |
| CREDIT |
| DEBIT  |
| LOCK   |
| UNLOCK |

### ReferenceType (modelo-alvo)

| Valor      |
| ---------- |
| DEPOSIT    |
| WITHDRAWAL |
| ORDER      |
| TRADE      |
| ADJUSTMENT |

## Relacionamentos

| Relacionamento       | Cardinalidade |
| -------------------- | ------------- |
| LedgerEntry → Wallet | N : 1         |

## Invariantes

| ID      | Regra                                          |
| ------- | --------------------------------------------------- |
| MOD-036 | LedgerEntry nunca pode ser alterado — mesma regra de INV-014 |
| MOD-037 | LedgerEntry nunca pode ser removido — mesma regra de INV-014 |
| MOD-038 | amount > 0                                     |
| MOD-039 | Deve possuir referência de origem (transactionId) — mesma regra de INV-006 |
| MOD-040 | Toda alteração de saldo deve gerar LedgerEntry — mesma regra de INV-005 |

## Exemplo

| Campo        | Valor  |
| ------------ | ------ |
| Tipo         | CREDIT |
| Ativo        | BTC    |
| Valor        | 0.10   |
| Saldo Antes  | 0.40   |
| Saldo Depois | 0.50   |

---

# Regras Gerais do Domínio

| ID      | Regra                                          |
| ------- | --------------------------------------------------- |
| MOD-041 | Nenhum saldo pode se tornar negativo — mesma regra de INV-001/002/003 |
| MOD-042 | Todo movimento financeiro deve ser auditável         |
| MOD-043 | Toda alteração de saldo deve gerar LedgerEntry — mesma regra de INV-005 |
| MOD-044 | Trades não podem ser alterados após execução — mesma regra de GLOB-011 |
| MOD-045 | Ledger é imutável — mesma regra de INV-014          |
| MOD-046 | Matching Engine não altera saldo diretamente         |
| MOD-047 | Liquidação deve ocorrer através da Wallet            |
| MOD-048 | Balance é uma projeção derivada do Ledger            |
| MOD-049 | Ledger é a fonte única da verdade financeira         |
