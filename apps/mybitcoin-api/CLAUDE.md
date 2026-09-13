# mybitcoin-api — Guia para Claude Code

## O que é este projeto

API de uma plataforma de criptomoedas real. Funcionalidades: autenticação/KYC, carteiras, ledger financeiro com dupla entrada, order book, matching engine, depósitos/saques Bitcoin on-chain.

**Repositório relacionado:** `/home/paulohenrique/Developer/mybitcoin/mybitcoin-api` — esta API.
**Frontend relacionado:** `/home/paulohenrique/Developer/mybitcoin/mybitcoin-front` — SPA React que consome esta API.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | NestJS 11 |
| Linguagem | TypeScript 5.7 |
| Banco | PostgreSQL (driver `pg` — sem ORM) |
| Testes | Jest 30 |
| Observabilidade | OpenTelemetry |
| Package manager | pnpm |

---

## Arquitetura

Este projeto usa **Clean Architecture + DDD**. A documentação de referência está em `../../docs/architecture/`:

- `01-analise-projeto-anterior.md` — análise de sistemas similares de matching: o que funcionou e o que evoluir
- `02-clean-architecture-ddd-fundamentos.md` — princípios: Regra de Dependência, 4 camadas, DDD, UnitOfWork, erros tipados, bigint
- `03-estrutura-projeto.md` — estrutura concreta de pastas e convenções de nomenclatura
- `04-quando-usar-clean-architecture.md` — critério para CA vs abordagem simples

### Estrutura de pastas

```
src/
├── infrastructure/              ← infraestrutura compartilhada (DatabaseService, migrations, telemetry)
│   ├── database/
│   │   ├── database.module.ts
│   │   ├── database.service.ts
│   │   ├── unit-of-work.postgres.ts
│   │   └── migrations/
│   └── telemetry/
├── modules/                     ← módulos de negócio, cada um com suas próprias camadas CA
│   └── <contexto>/
│       ├── domain/              ← entidades, value objects, interfaces *Repository, erros
│       ├── application/         ← use cases
│       ├── infrastructure/      ← implementações de repositórios, SQL
│       │   └── persistence/
│       │       ├── pg-*.repository.ts
│       │       └── *.sql.ts
│       ├── presentation/        ← controllers, DTOs, módulos NestJS
│       └── <contexto>.module.ts
├── shared/                      ← artefatos de domínio compartilhados entre módulos
│   ├── domain.error.ts
│   └── unit-of-work.ts
└── app.module.ts
```

Cada módulo é autocontido. O detalhe completo está em `../../docs/architecture/03-estrutura-projeto.md`.

### Regra de Dependência

Dentro de cada módulo, dependências só apontam para dentro:

```
presentation → application → domain
infrastructure (do módulo) → domain
```

`<módulo>/domain/` nunca importa de `application/`, `infrastructure/` ou `presentation/`. Verifique com:

```bash
grep -r "from '.*application\|from '.*infrastructure\|from '.*presentation" src/modules/*/domain/
```

---

## Convenções críticas

### Valores monetários — sempre `bigint`

Toda unidade monetária é representada em **satoshi** como `bigint` no TypeScript e `BIGINT` no PostgreSQL. Nunca `number`, nunca `float`, nunca `BigNumber`.

```typescript
// Correto
const amount: bigint = 100_000n
// Errado
const amount: number = 100000
const amount = new BigNumber(100000)
```

Campos SQL devem ter sufixo `_satoshi`: `amount_satoshi BIGINT NOT NULL`.

### Erros de domínio — sempre tipados

Nunca retornar `boolean` ou `null` para indicar falha de regra de negócio. Sempre lançar subclasse de `DomainError`.

```typescript
// Correto
throw new InsufficientBalanceError(accountId, required, available)
// Errado
return false
return { success: false, error: 'Saldo insuficiente' }
```

### Atomicidade — UnitOfWork

Operações que escrevem em mais de uma tabela DEVEM usar `UnitOfWork`. Nunca queries manuais em transações sequenciais sem garantia de rollback.

```typescript
await this.uow.run(async ({ transactionRepo, ledgerRepo }) => {
  await transactionRepo.save(tx)
  await ledgerRepo.save(debit)
  await ledgerRepo.save(credit)
})
```

### SQL — nunca inline nos repositórios

SQL fica em `src/modules/<contexto>/infrastructure/persistence/*.sql.ts` como constantes nomeadas. Repositórios importam e usam essas constantes.

### Repositórios

- **Abstract class** em `src/modules/<contexto>/domain/<nome>.repository.ts` — sem prefixo: `TransactionRepository` (não `ITransactionRepository`)
- **Implementação** em `src/modules/<contexto>/infrastructure/persistence/pg-<nome>.repository.ts` — usa `extends`: `class PgTransactionRepository extends TransactionRepository`
- No módulo NestJS: `{ provide: TransactionRepository, useFactory: (db) => new PgTransactionRepository(db), inject: [DatabaseService] }`
- Métodos `find*` retornam entidade de domínio ou `null` — nunca `undefined`, nunca `boolean`
- Métodos `save`/`delete` retornam `void` — nunca `boolean`

---

## Documentação de negócio

Em `../../docs/bussiness/` — estes são os documentos de referência tratados como "lei" do domínio:

| Arquivo | Conteúdo |
|---------|---------|
| `01-visao-geral-sistema.md` | Visão macro, bounded contexts |
| `02-identidade-e-acesso.md` | Regras CAD/LOG/OUT/REC/SES/VER/KYC/MFA |
| `03-modelo-de-dominio.md` | Entidades, aggregates, value objects |
| `04-carteiras-e-ledger-financeiro.md` | INV-001 a INV-014, dupla entrada, ledger |
| `05-mercados-de-negociacao.md` | Pares, order book |
| `06-order-book.md` | Estrutura do order book |
| `07-matching-engine.md` | Algoritmo de matching |
| `08-trades-maker-taker-taxas.md` | Maker/Taker/Charger, cálculo de taxas |
| `09-depositos-e-saques.md` | Fluxos on-chain |
| `10-eventos-de-dominio-e-auditoria.md` | Domain events, auditoria |
| `11-invariantes-globais.md` | Invariantes globais do sistema |
| `12-cenarios-bdd.md` | Cenários BDD (Gherkin) |

## ADRs

Em `../../docs/adr/` — decisões arquiteturais já tomadas (ADRs antigos em `../../docs/old-adrs/`):

| ADR | Decisão |
|-----|---------|
| `0001-unit-of-work-pattern.md` | Padrão UnitOfWork para atomicidade (UnitOfWork abstrato + implementação Postgres) |
| `0002-identity-registration.md` | Cadastro de usuários (CAD-001 a CAD-007) — bounded context `identity`, bcrypt, status `PENDING_EMAIL_VERIFICATION` |
| `0003-read-write-database-replication.md` | Réplica de leitura PostgreSQL — `WRITE_POOL_TOKEN`/`READ_POOL_TOKEN`, padrão `XRepository`/`XReadRepository` por módulo |
| `0004-session-token-transport.md` | Transporte de sessão via cookie `httpOnly` (`__Host-session`/`__Host-csrf`), CSRF double-submit, `DomainErrorFilter` |
| `0005-login-logout.md` | Login e Logout (LOG-001 a LOG-006, OUT-001 a OUT-003) — bloqueio por tentativas (LOG-006), `ValidationPipe` global |

---

## Comandos principais

```bash
pnpm install                  # instalar dependências
pnpm start:dev                # servidor em modo watch
pnpm prepare:test             # sobe o Postgres de teste (primary+replica) e roda migrations
pnpm test                     # testes (unitários + integração, precisa do prepare:test rodado antes)
pnpm test:cov                 # cobertura
pnpm migration:create         # criar arquivo de migration
pnpm migration:run            # aplicar migrations pendentes
pnpm migration:dry-run        # simular migrations sem aplicar
pnpm lint                     # linting
```

Antes de rodar `pnpm test` localmente, suba o banco de teste uma vez com `pnpm prepare:test` (containers `test-postgres-primary`/`test-postgres-replica` do `docker-compose.yml` da raiz do monorepo, portas `5444`/`5445` — isolados dos bancos de desenvolvimento). Sem isso, todo spec de integração falha por falta de conexão. O CI (`.github/workflows/ci.yml`) já faz isso automaticamente antes de rodar `pnpm test`.

---

## Estratégia de testes

O critério de onde vale a pena ter teste **unitário** (com mocks) não é "todo arquivo tem que ter um `.spec.ts`" — é se o comportamento tem lógica de decisão real (branches, invariantes, edge cases) que compensa isolar do banco.

- **Módulo `financial`** (transações, ledger, saldo, depósito, saque — tudo que move dinheiro): **testes unitários E de integração**. É onde há mais chance de edge case sutil (dupla confirmação, arredondamento, INV-001 a INV-014), e o mock permite forçar cenários difíceis de reproduzir de forma confiável só com banco (ex: forçar erro no meio de uma transação para validar rollback). O unitário aqui é do use case/entidade (`confirm-deposit.usecase.spec.ts`, `transaction.entity.spec.ts`), não do repositório.
- **Todo o resto** (`identity`, sessões, guards, controllers): **somente teste de integração**, batendo em HTTP real contra Postgres real (padrão em `identity.controller.spec.ts` e `sessions.controller.spec.ts`). Não crie `.usecase.spec.ts` mockando repositório para esses fluxos — se o comportamento é só orquestração/delegação sem branch de decisão, o teste de integração já cobre com mais fidelidade e sem duplicar setup.
- **Repositório (`pg-*.repository.ts`) nunca tem spec próprio, em nenhum módulo** — nem unitário mockando `db.query`, nem integração isolada batendo direto no repositório. O teste de integração do fluxo completo (controller ou use case, contra Postgres real) já exercita o repositório de ponta a ponta, incluindo o SQL de verdade; um spec dedicado a repositório só duplica esse caminho com um setup a mais para manter. Se um repositório novo não tem nenhum controller/use case cobrindo o fluxo que o exercita, crie esse teste de integração — não um spec avulso do repositório.
- **Especificamente evite:**
  - Testes que só verificam `toHaveBeenCalledWith` num mock que devolve exatamente o que foi mandado devolver (não prova nada sobre o comportamento real).
  - Testes de "arquitetura" via reflexão (`Object.getOwnPropertyNames` para provar que uma interface não tem certo método) — isso é responsabilidade do TypeScript/design da interface, não de um teste que roda em CI.
  - Duplicar em unitário um cenário que a suíte de integração já cobre igual ou melhor.
- **Entidades e value objects de domínio puro** (sem I/O) continuam com teste unitário normalmente — não têm banco para integrar contra, e a lógica de invariante mora ali mesmo (ex: `transaction.entity.spec.ts`, `email.vo.spec.ts`).

---

## Invariantes financeiros (resumo)

Nunca implemente código que toque ledger sem ler `../../docs/bussiness/04-carteiras-e-ledger-financeiro.md`. As regras críticas:

- **INV-001/002/003** — Saldos nunca negativos
- **INV-005** — Toda movimentação de saldo cria `ledger_entry`
- **INV-006** — Nenhum `ledger_entry` sem `transaction_id`
- **INV-007** — `Σ débitos = Σ créditos` por transação (dupla entrada)
- **INV-014** — `ledger_entries` são imutáveis — nunca UPDATE/DELETE

---

## O que NÃO fazer

- **Não use ORM** — só driver `pg` com SQL explícito
- **Não use `number` para valores financeiros** — apenas `bigint`
- **Não retorne `boolean` de repositório** — lance `DomainError` tipado
- **Não coloque SQL inline em repositórios de CA** — use `*.queries.ts`
- **Não importe infraestrutura em `src/modules/*/domain/`** — violação da Regra de Dependência
- **Não processe operação financeira sem verificar KYC** — veja `../../docs/bussiness/02-identidade-e-acesso.md`
- **Não faça múltiplos writes sem `UnitOfWork`** — risco de estado parcial
- **Não crie `.usecase.spec.ts` unitário mockando repositório fora do módulo `financial`** — veja [Estratégia de testes](#estratégia-de-testes)
- **Não crie spec dedicado para `pg-*.repository.ts`** (nem unitário nem integração isolada), em nenhum módulo — cubra o repositório via teste de integração do controller/use case que o usa
