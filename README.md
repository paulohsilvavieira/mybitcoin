# MyBitcoin

Monorepo da plataforma MyBitcoin — uma exchange de criptomoedas. Reúne o backend, o frontend web e o app mobile num único repositório, com histórico de commits preservado dos três projetos que o originaram (`mybitcoin-api`, `mybitcoin-front`, `mybitcoin-app`).

## O que é este projeto

Funcionalidades cobertas pela plataforma: autenticação/KYC, carteiras, ledger financeiro com dupla entrada, order book, matching engine, depósitos/saques de Bitcoin on-chain.

## Estrutura do monorepo

```
mybitcoin/
├── apps/
│   ├── mybitcoin-api/      ← Backend (NestJS + PostgreSQL)
│   ├── mybitcoin-front/    ← Frontend web (Vite + React)
│   └── mybitcoin-app/      ← App mobile (Expo Router / React Native)
├── packages/
│   ├── eslint-config/      ← Configuração de ESLint compartilhável (ainda não adotada pelos apps)
│   ├── typescript-config/  ← tsconfig.json base compartilhável (ainda não adotada pelos apps)
│   └── ui/                 ← Biblioteca de componentes React compartilhável (scaffold do Turborepo, ainda não usada)
├── docs/
│   ├── adr/                ← Registro de decisões arquiteturais (ADRs) — histórico de decisões já tomadas
│   ├── architecture/       ← Fundamentos de arquitetura (Clean Architecture + DDD) usados pelo backend
│   ├── bussiness/          ← Documentação de regras de negócio — tratada como "lei" do domínio
│   ├── old-adrs/           ← ADRs superados, mantidos só como referência histórica
│   └── examples/           ← Exemplos de padrões de código já superados/substituídos
├── turbo.json               ← Pipelines do Turborepo (build, lint, test, dev)
└── pnpm-workspace.yaml       ← Definição do workspace pnpm
```

Cada app em `apps/` mantém seu próprio `CLAUDE.md`/`README.md` com convenções específicas — vale a pena ler o de cada um antes de mexer nele. `apps/mybitcoin-api/CLAUDE.md` é o mais detalhado, já que a API segue Clean Architecture + DDD com regras rígidas (ver seção "Convenções por app" abaixo).

Os três apps ainda usam suas próprias configs de lint/TypeScript (`packages/eslint-config`, `packages/typescript-config`, `packages/ui` existem no scaffold do Turborepo, mas a migração para eles é um passo futuro, não feito nesta unificação).

---

## Pré-requisitos

| Ferramenta | Versão |
|---|---|
| Node.js | ≥ 24 |
| pnpm | 11.x (o repo fixa `packageManager: pnpm@11.25.0`) |
| Docker + Docker Compose | necessário só para rodar a API com banco real (Postgres primary/replica) |

Para o app mobile (Expo), veja também os pré-requisitos do [Expo](https://docs.expo.dev/get-started/installation/) (Xcode para iOS, Android Studio para Android, ou apenas o navegador para `--web`).

---

## Instalação

Na raiz do monorepo:

```bash
pnpm install
```

Isso instala as dependências de todos os workspaces (`apps/*` e `packages/*`) de uma vez, via pnpm workspaces.

O `pnpm-workspace.yaml` já aprova os scripts de build de dependências nativas necessários (`bcrypt`, `esbuild`, `@parcel/watcher`, `protobufjs`, `unrs-resolver`). Se o pnpm reclamar de builds ignorados (ex.: depois de adicionar uma dependência nova que também precise compilar nativo), rode `pnpm approve-builds` e adicione a entrada correspondente em `pnpm-workspace.yaml`.

---

## Comandos (via Turborepo)

Todos os comandos abaixo rodam a partir da **raiz do monorepo** e usam o [Turborepo](https://turborepo.dev) para orquestrar as tasks em paralelo, com cache. Cada task só roda no(s) app(s) que tiver o script correspondente no seu `package.json` — apps sem o script são pulados automaticamente.

```bash
pnpm build       # build de mybitcoin-api (nest build) e mybitcoin-front (tsc -b && vite build)
pnpm dev         # sobe todos os apps em modo watch/dev, em paralelo (nest start --watch, vite, expo start)
pnpm lint        # lint de mybitcoin-api (eslint --fix), mybitcoin-front (eslint) e mybitcoin-app (expo lint)
pnpm test        # testes de mybitcoin-api (jest) e mybitcoin-front (vitest run)
```

Rodar um app específico com o filtro do Turborepo:

```bash
pnpm exec turbo run dev --filter=mybitcoin-api
pnpm exec turbo run build --filter=mybitcoin-front
pnpm exec turbo run lint --filter=mybitcoin-app
pnpm exec turbo run test --filter=mybitcoin-api
```

Os nomes de filtro são os campos `name` do `package.json` de cada app: `mybitcoin-api`, `mybitcoin-front`, `mybitcoin-app`. `mybitcoin-app` não define scripts `build`/`test` (apps Expo não têm build tradicional) — o Turborepo pula essas tasks automaticamente para ele.

---

## Comandos por app, direto da raiz (`pnpm api:*` / `pnpm front:*` / `pnpm app:*`)

Além das tasks do Turborepo acima (pensadas para rodar nos três apps de uma vez), o `package.json` da raiz também expõe **todos** os scripts individuais de cada app, prefixados por `api:`, `front:` ou `app:`. Isso evita precisar dar `cd apps/<app>` só para rodar um comando específico — cada um é só um atalho para `pnpm --filter <nome-do-app> <script>`.

```bash
# backend (mybitcoin-api)
pnpm api:start:dev              # nest start --watch
pnpm api:test                   # jest
pnpm api:test:cov
pnpm api:test:e2e
pnpm api:lint
pnpm api:migration:run
pnpm api:migration:dry-run
pnpm api:seed:run               # aplica os seeds pendentes (ver "Fluxo de seeds" abaixo)
pnpm api:seed:dry-run
pnpm api:prepare:test           # sobe o Postgres de teste e roda as migrations de teste

# frontend web (mybitcoin-front)
pnpm front:dev
pnpm front:build
pnpm front:lint
pnpm front:test
pnpm front:test:watch

# mobile (mybitcoin-app)
pnpm app:start
pnpm app:android
pnpm app:ios
pnpm app:web
pnpm app:lint
```

Scripts que recebem argumento (como `migration:create`/`seed:create`, que esperam um nome) precisam do `--` do pnpm para repassar o argumento até o comando de verdade:

```bash
pnpm api:migration:create -- create_orders_table
pnpm api:seed:create -- seed_markets
```

A lista completa e atualizada de scripts por app fica nos respectivos `package.json` (`apps/mybitcoin-api/package.json`, `apps/mybitcoin-front/package.json`, `apps/mybitcoin-app/package.json`) — os atalhos na raiz espelham exatamente os nomes de lá, só com o prefixo do app na frente.

---

## Rodando cada app individualmente

### `mybitcoin-api` (backend)

```bash
cd apps/mybitcoin-api
cp .env.example .env          # ajustar credenciais se necessário
docker compose up -d --wait postgres-primary postgres-replica
pnpm migration:run
pnpm start:dev                 # http://localhost:3000
```

Outros comandos úteis, direto na pasta do app:

```bash
pnpm test                      # testes unitários + de integração (exige banco — ver abaixo)
pnpm test:cov                  # com cobertura
pnpm test:e2e                  # testes e2e
pnpm migration:create <nome>   # criar novo arquivo de migration (schema)
pnpm migration:dry-run         # simular migrations sem aplicar
```

**Testes de integração exigem um banco de teste rodando:**

```bash
pnpm prepare:test               # sobe test-postgres-primary/replica via docker compose e roda as migrations de teste
```

Sem isso, os testes de integração/e2e falham por não conseguir conectar ao Postgres — é esperado, não é bug.

#### Fluxo de seeds (dados de referência)

Além de migrations (schema), a API tem um fluxo análogo para popular **dados de referência** (ex.: catálogo de ativos, mercados seedados) — arquivos `.sql` em `src/infrastructure/database/seeds/`, aplicados uma única vez e rastreados numa tabela própria (`schema_seeds`), do mesmo jeito que migrations são rastreadas em `schema_migrations`. Não é upsert: para mudar um dado já seedado, cria-se um novo arquivo de seed com o `UPDATE` necessário, mantendo o histórico imutável.

```bash
pnpm seed:create <nome>         # cria src/infrastructure/database/seeds/<timestamp>_<nome>.sql
pnpm seed:run                   # aplica os seeds pendentes, em ordem, dentro de transação
pnpm seed:dry-run                # lista os pendentes sem aplicar
```

Seeds **não** rodam automaticamente junto de `migration:run`/`prepare:test` — é um passo manual, deliberadamente separado, para não popular dado de referência sem querer em ambientes onde isso não faz sentido (ex.: produção já seedada). Rode migrations primeiro, depois seeds:

```bash
pnpm migration:run
pnpm seed:run
```

Documentação de arquitetura e regras de negócio da API vive na raiz do monorepo (`docs/`), não mais dentro da pasta do app — ver seção "Documentação" abaixo.

### `mybitcoin-front` (frontend web)

```bash
cd apps/mybitcoin-front
pnpm dev                        # http://localhost:5173, hot reload via Vite
```

Requer a API rodando em `http://localhost:3000` (ou defina `VITE_API_URL` apontando para outro host).

```bash
pnpm build                      # build de produção (tsc -b && vite build)
pnpm preview                     # servir o build de produção localmente
pnpm test                        # vitest run
pnpm test:watch                  # vitest em modo watch
pnpm lint                        # eslint .
```

### `mybitcoin-app` (mobile — Expo)

```bash
cd apps/mybitcoin-app
cp .env.example .env             # EXPO_PUBLIC_API_URL=http://localhost:3000
pnpm start                        # abre o Metro bundler / Expo Dev Tools
```

A partir da tela de login (ADR 0005 — ver `docs/adr/0005-login-logout.md`), o app usa um módulo nativo de cookie manager e **saiu do Expo Go** — rode com dev client:

```bash
pnpm android                      # expo run:android
pnpm ios                          # expo run:ios
pnpm web                          # expo start --web (sem restrição de dev client)
```

Requer a API rodando e acessível pelo dispositivo/emulador (`EXPO_PUBLIC_API_URL`).

---

## Documentação

A documentação de arquitetura e de regras de negócio é compartilhada por todos os apps e vive na raiz do monorepo, em `docs/`:

| Pasta | Conteúdo |
|---|---|
| [`docs/architecture/`](docs/architecture/) | Fundamentos de Clean Architecture + DDD, estrutura de pastas, critério de quando aplicar CA vs. abordagem simples — referência principal usada pelo backend |
| [`docs/bussiness/`](docs/bussiness/) | Regras de negócio da plataforma (identidade/acesso, carteiras/ledger, mercados, order book, matching engine, taxas, depósitos/saques, invariantes globais, cenários BDD) — tratadas como "lei" do domínio |
| [`docs/adr/`](docs/adr/) | Registro de decisões arquiteturais (ADRs) já tomadas e implementadas, numeradas sequencialmente (0001 em diante). Algumas cobrem mais de um app quando a mesma decisão atravessa backend/frontend/mobile (ex.: `0005-login-logout.md`) |
| [`docs/old-adrs/`](docs/old-adrs/) | ADRs superados por decisões mais recentes, mantidos só como referência histórica |
| [`docs/examples/`](docs/examples/) | Exemplos de padrões de código já substituídos por decisões mais recentes |

Cada app também tem seu próprio `CLAUDE.md`/`README.md` com convenções específicas de código (ex.: `apps/mybitcoin-api/CLAUDE.md` documenta as regras de Clean Architecture, uso de `bigint` para valores monetários, UnitOfWork, etc. — leitura obrigatória antes de tocar em código financeiro).

---

## CI/CD

Os workflows do GitHub Actions vivem em `.github/workflows/` na raiz (o GitHub só reconhece workflows nesse caminho — pastas `.github/` dentro de `apps/*` são ignoradas pela plataforma):

| Workflow | O que faz | Status no monorepo |
|---|---|---|
| `ci.yml` | Lint, build e testes dos três apps via Turborepo (`pnpm lint`/`build`/`test` a partir da raiz), mais os testes de replicação Postgres da API (ADR 0003) | ✅ Adaptado — roda para `mybitcoin-api`, `mybitcoin-front` e `mybitcoin-app` |
| `deploy-automatic.yml`, `deploy-prod.yml`, `deploy-manual.yml`, `manual-deploy.yml` | Build & push de imagem Docker da API, atualização de manifest e deploy via ArgoCD | ⚠️ **Só movidos, não adaptados** — ainda apontam para o Dockerfile/`k8s/` na raiz do repo antigo standalone (`--repo https://github.com/paulohsilvavieira/mybitcoin-api.git`, `context: .`, `k8s/production/...`). Precisam ser atualizados para os paths do monorepo (`apps/mybitcoin-api/Dockerfile`, `apps/mybitcoin-api/k8s/...`) e para a URL do novo repositório antes de serem usados — deixados pendentes deliberadamente até o monorepo ser publicado e as secrets configuradas nele |

`deploy-automatic.yml` e `deploy-prod.yml` já eram duas versões praticamente duplicadas do mesmo pipeline antes da migração (nomes de imagem/app diferentes: `mybtc-api` vs `mybitcoin-api`) — vale decidir qual delas manter ao fazer o ajuste acima, em vez de manter as duas.

---

## Sobre a unificação deste monorepo

Este repositório nasceu da unificação de três repositórios antigos (`mybitcoin-api`, `mybitcoin-front`, `mybitcoin-app`), preservando o histórico completo de commits de cada um (via `git filter-repo`, movendo cada repo para sua respectiva subpasta em `apps/` antes de mesclar os históricos). Branches de feature ainda em desenvolvimento no momento da unificação também foram migradas quando possível. A documentação de arquitetura/negócio, antes duplicada ou específica de cada repo, foi consolidada em `docs/` na raiz.
