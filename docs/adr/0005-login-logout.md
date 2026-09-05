
# ADR 0005 — Identity: Login e Logout (Backend, Frontend Web e Mobile)

**Status:** Implementado

**PRs:** Backend/Frontend Web — https://github.com/paulohsilvavieira/mybitcoin-api/pull/5 (mergeado). Mobile — `feat(auth): tela de login e camada de autenticação` (histórico de commits de `apps/mybitcoin-app`).

**Datas:** Backend/Frontend Web — 2026-08-01. Mobile — 2026-08-12.

**Autores:** Time de Backend (2026-08-01), Time Mobile (2026-08-12)

**Contexto relacionado:** ADR 0002 (Identity: Cadastro de Usuários), ADR 0004 (Transporte de Sessão via Cookie httpOnly)

**Gerado por:** skill `/adr-architect`

**Nota de consolidação:** Este documento consolida duas decisões originalmente registradas separadamente — `mybitcoin-api/docs/adr/0005-login-logout.md` (backend + bootstrap do `mybitcoin-front`) e `mybitcoin-app/docs/adr/0001-login-screen.md` (mobile) — durante a unificação dos três repositórios em monorepo (2026-09-04). O conteúdo de ambas foi preservado; a numeração e a estrutura de seções foram unificadas. A seção "Mobile — Tela de Login" cobre a decisão específica do app; as demais seções (Backend, Frontend Web) refletem o documento original da API.

---

## Contexto

O bounded context `identity` tem hoje Cadastro (ADR 0002, CAD-001 a CAD-007) e a infraestrutura de Sessões (ADR 0004: cookie `__Host-session`, cookie CSRF `__Host-csrf`, `SessionAuthGuard`, `DomainErrorFilter`, `cookie-parser`, CORS) implementados e funcionando. `docs/bussiness/02-identidade-e-acesso.md` define ainda Login (LOG-001 a LOG-006) e Logout (OUT-001 a OUT-003) — nenhum dos dois implementado.

O ADR 0004 já deixou pronto o contrato que Login/Logout precisam consumir: `CreateSession` (mint de token + persistência), `RevokeSession`/`RevokeAllSessions` (revogação), `setSessionCookies`/`clearSessionCookies` (helpers de cookie), `SessionAuthGuard` (proteção de rota) e `DomainErrorFilter` (mapeamento de erro → HTTP). Este ADR fecha o elo que faltava: **validar credenciais e criar/revogar sessão a partir delas**, o único pedaço do fluxo de autenticação que ainda não existia.

Duas descobertas de código, feitas antes deste ADR, moldam o escopo:

1. **Verificação de e-mail não existe de fato.** `RegisterUser` gera um `verificationToken` mas nunca o persiste, e `EmailService.sendVerification` é um stub no-op (`identity.module.ts:52-56`). Nenhum usuário jamais transita de `PENDING_EMAIL_VERIFICATION` para `ACTIVE` hoje. LOG-002 ("email deve estar verificado") aplicado à risca bloquearia login para 100% dos usuários.
2. **`mybitcoin-front` está no template inicial do Vite.** `App.tsx` é o boilerplate padrão, sem roteador configurado (apesar de `react-router-dom` já ser dependência), sem cliente HTTP, sem páginas. Existe apenas um `useAuthStore` (Zustand) e um `ProtectedRoute` esqueleto, ambos nunca conectados a uma API real.

Este ADR cobre Login, Logout (sessão atual e global) e o endpoint de perfil (`GET /auth/me`) necessário para o frontend restaurar sessão — API e bootstrap mínimo do frontend (roteamento, cliente HTTP, páginas de login). Meses depois (2026-08-12), a mesma decisão de sessão foi portada para o mobile (`mybitcoin-app`) — ver seção "Mobile — Tela de Login" abaixo.

**Fora de escopo** (não implementado aqui, tratado como débito técnico documentado): MFA/2FA (LOG-004), Recuperação de Senha, Verificação de E-mail, KYC. (Bloqueio por excesso de tentativas — LOG-006 — foi implementado numa emenda posterior, ver "Emenda (pós-implementação)" abaixo.)

---

## Forças em Jogo

- LOG-003 exige que credenciais inválidas não revelem qual campo está incorreto — usuário inexistente e senha errada devem produzir o mesmo erro
- LOG-005 exige auditoria de toda tentativa de login, inclusive falhas, sem que este ADR precise criar um mecanismo de auditoria novo (event bus/event store não existem no projeto — dívida já registrada no ADR 0004)
- LOG-002, aplicado literalmente, travaria o sistema inteiro porque verificação de e-mail não está implementada — decisão consciente de relaxar essa regra até o fluxo de verificação existir
- OUT-001/002/003 exigem idempotência: sessão já expirada ou token inválido não devem gerar erro
- O ADR 0004 já define o contrato de cookies/CSRF/guard — este ADR não pode reabrir essas decisões, só consumi-las
- `mybitcoin-front` não tem nenhuma infraestrutura de app (roteador, cliente HTTP) — sem isso, Login/Logout não têm como ser exercitados de ponta a ponta
- A sessão é 100% cookie `httpOnly` (ADR 0004) — o frontend nunca vê o token de sessão; o campo `token` do `useAuthStore` atual é resquício de um design de bearer token e está desalinhado com a decisão vigente

---

## Decisão

### Backend — Login

Novo use case `Login` (`application/login.usecase.ts`), injeta `UserRepository` e uma função `comparePassword: (plain: string, hash: string) => Promise<boolean>` (mesmo padrão de injeção usado por `hashPassword` em `RegisterUser`, ADR 0002).

Fluxo:
1. `Email.create(input.email)` — formato inválido lança `InvalidEmailError` (422, já existente) — não é um vazamento de LOG-003 porque é validação de formato, não revela existência de conta.
2. Busca usuário por e-mail. Não encontrado → `InvalidCredentialsError` (genérico, LOG-003).
3. Compara senha via `comparePassword`. Não bate → `InvalidCredentialsError` (mesmo erro do passo anterior — usuário não distingue "e-mail não existe" de "senha errada").
4. Se `user.status.isSuspended()` → `AccountSuspendedError` (erro específico — decisão do usuário: suspensão não é segredo de segurança como senha, e o usuário suspenso legítimo precisa saber o motivo).
5. `PENDING_EMAIL_VERIFICATION` e `ACTIVE` são **ambos aceitos** (LOG-002 relaxado — ver Rationale).
6. Retorna dados do usuário (`userId`, `name`, `email`, `status`) — **não** cria sessão; isso é responsabilidade do controller, que encadeia com `CreateSession` (já existente, ADR 0004).

O controller (`POST /auth/login`) orquestra: `Login.execute()` → `CreateSession.execute({ userId, deviceInfo: <User-Agent>, ipAddress: <IP> })` → `setSessionCookies(response, { token, expiresAt })` → responde `200` com `{ userId, name, email, status }`.

### Backend — Logout (sessão atual)

Novo use case `Logout` (`application/logout.usecase.ts`), injeta `SessionRepository`. Recebe o token em claro (do cookie), calcula o hash (mesmo padrão de `ValidateSession`), busca a sessão por `findByTokenHash`. Se encontrada e ainda não revogada, revoga e retorna o evento `SessionRevoked` (`reason: 'user_requested'`). Se não encontrada, já revogada, ou token ausente/inválido — **não lança erro**, retorna `{ event: null }`. Idempotência total, conforme os edge cases OUT-001/OUT-003 da documentação.

`POST /auth/logout` **não usa `SessionAuthGuard`** — lê `request.cookies['__Host-session']` diretamente. Sempre chama `clearSessionCookies(response)` e sempre responde `204`, independentemente do estado da sessão.

**Por quê sem guard:** o guard rejeitaria com `401` quando não há cookie ou a sessão já expirou — exatamente os dois casos que a documentação de negócio pede para tratar como sucesso idempotente. Colocar o guard aqui contradiria OUT-001/OUT-003.

### Backend — Logout global

Reusa `RevokeAllSessions` (ADR 0004, já existente e implementado, apenas nunca exposto por um controller). `POST /auth/logout-all` **usa `SessionAuthGuard`** (precisa saber `userId` de forma confiável — diferente do logout de sessão única, aqui não há ambiguidade a tolerar: se não há sessão válida, não há "todas as sessões do usuário" para revogar). Chama `RevokeAllSessions.execute({ userId: request.user.userId, reason: 'logout_all' })` (o valor `'logout_all'` já existe no enum `SessionRevokedReason` do ADR 0004, nunca usado até agora), depois `clearSessionCookies(response)`, responde `204`.

### Backend — Perfil do usuário autenticado

Novo use case `GetCurrentUser` (`application/get-current-user.usecase.ts`), injeta `UserReadRepository`, busca por `userId`. `GET /auth/me` usa `SessionAuthGuard`, retorna `{ id, name, email, status }`. Necessário para o frontend restaurar o estado de autenticação ao recarregar a página, já que a sessão é um cookie `httpOnly` opaco — o frontend não tem outra forma de saber quem está autenticado.

### Backend — Auditoria (LOG-005)

Log estruturado, mesmo padrão de `RegisterUser` (`this.logger.log/warn` com `operation`, `email`, `reason`, `duration_ms`) no controller, cobrindo: tentativa iniciada, sucesso, falha por credenciais inválidas, falha por conta suspensa. Sem tabela nova, sem event bus — não expande a dívida arquitetural já registrada no ADR 0004 (domain events sem mecanismo de publicação).

### Backend — Erros de domínio novos

**Correção pós-validação (gap 1 — ALTO):** `DomainErrorFilter` devolve `error.message` ao cliente **verbatim** (`domain-error.filter.ts:22`). O padrão já usado no módulo embute o valor recebido na mensagem (`EmailAlreadyExistsError`: `` `Email '${email}' is already registered` ``; `SessionNotFoundError`: `` `Session '${sessionId}' not found` ``). Copiar esse padrão para `InvalidCredentialsError` reabriria a enumeração de contas que LOG-003 existe para fechar (a mensagem ecoaria o e-mail informado, ou pior, dois textos ligeiramente diferentes para "e-mail não existe" vs "senha errada"). Por isso os dois erros abaixo usam **mensagem estática, sem interpolação**, explicitamente diferente do padrão do resto do módulo:

- `InvalidCredentialsError` (`identity/domain/errors/invalid-credentials.error.ts`) — `code: 'INVALID_CREDENTIALS'`. Construtor **sem parâmetros**, mensagem fixa: `super('Invalid email or password')`. Usado idêntico nos dois branches (e-mail não encontrado, senha incorreta) — nem o código nem a mensagem podem variar entre os dois casos.

**Correção pós-validação (gap 2 — MÉDIO):** mesma mecânica seguida pelo padrão de `SessionNotFoundError(sessionId)` vazaria o UUID interno do usuário na resposta HTTP sem necessidade (o cliente já sabe qual conta tentou logar).

- `AccountSuspendedError` (`identity/domain/errors/account-suspended.error.ts`) — `code: 'ACCOUNT_SUSPENDED'`. Construtor recebe `userId` (para uso em log estruturado no controller, LOG-005), mas a mensagem exposta ao cliente é estática e não o contém: `super('This account has been suspended')`.
- `UserNotFoundError` (`identity/domain/errors/user-not-found.error.ts`) — `code: 'USER_NOT_FOUND'`. Novo erro decorrente da correção do gap 3 (ver seção "Edge Cases & Erros de Domínio"), usado por `GetCurrentUser` quando o `userId` de uma sessão válida não resolve para um usuário existente. Mensagem estática: `super('User not found')` (não precisa embutir `userId` — o valor já veio do próprio cookie de sessão do requisitante, não é informação nova para ele).

Adicionados ao mapa de `DomainErrorFilter` (ADR 0004, `src/infrastructure/http/domain-error.filter.ts`): `INVALID_CREDENTIALS` → 401, `ACCOUNT_SUSPENDED` → 403, `USER_NOT_FOUND` → 401 (mesmo status de sessão inválida — ver Rationale abaixo).

### Frontend Web — Bootstrap mínimo

Como `App.tsx` ainda é o boilerplate do Vite e não existe cliente HTTP nem roteador configurado, este ADR inclui o bootstrap mínimo necessário para Login/Logout funcionarem de ponta a ponta:

- **Cliente HTTP** (`src/lib/api-client.ts`): wrapper sobre `fetch` com `credentials: 'include'` (obrigatório para o navegador enviar/receber os cookies `__Host-session`/`__Host-csrf` — ADR 0004). Para métodos mutantes (`POST`/`PUT`/`PATCH`/`DELETE`), lê o cookie `__Host-csrf` via `document.cookie` (não-`httpOnly`, por design do ADR 0004) e injeta o header `X-CSRF-Token`. Em erro, usa `parseApiError`/`ApiError` já existentes em `src/lib/api-errors.ts`.
- **Roteador**: `react-router-dom` configurado em `App.tsx` (`createBrowserRouter`), com rotas `/login` (pública) e uma rota protegida mínima de exemplo usando `ProtectedRoute` (já existe, sem alterações de lógica).
- **Service de auth** (`src/services/auth.service.ts`): `login(email, password)`, `logout()`, `logoutAll()`, `getMe()` — chamam o cliente HTTP contra `POST /auth/login`, `POST /auth/logout`, `POST /auth/logout-all`, `GET /auth/me`.
- **Store** (`src/stores/use-auth-store.ts`): remove o campo `token` (nunca acessível ao JS, por design do ADR 0004). Mantém `user: User | null`, `isLoading`, `kycStatus`, `setUser`, `setLoading`, `setKycStatus`, `logout` (agora só limpa estado local — a chamada real ao backend é do service).
- **Página de Login** (`src/pages/login-page.tsx`): formulário e-mail/senha, chama `authService.login`, popula `useAuthStore` com o usuário retornado, redireciona para a rota protegida de exemplo (ou para `location.state.from`, padrão já usado em `ProtectedRoute`).
- **Bootstrap de sessão**: no carregamento inicial da aplicação, chama `authService.getMe()`; sucesso popula `useAuthStore.setUser`, falha (401) mantém `user: null`; em ambos os casos `setLoading(false)` ao final — consistente com o uso de `isLoading` já feito por `ProtectedRoute`.

### Rationale (Backend / Frontend Web)

**Por que relaxar LOG-002 em vez de bloquear login até Verificação de E-mail existir?**
Bloquear login incondicionalmente para contas não verificadas, sem que exista nenhum caminho para verificá-las (token gerado nunca é persistido), tornaria o sistema inutilizável por qualquer usuário cadastrado — não é um trade-off aceitável para uma decisão que pode ser revertida quando Verificação de E-mail (fora de escopo deste ADR) for implementada. A decisão é documentada explicitamente aqui para não ser confundida com um descuido.

**Por que `Login` retorna dados do usuário em vez de já criar a sessão internamente?**
Mantém o use case de domínio (validação de credenciais) desacoplado da decisão de infraestrutura de sessão (ADR 0004, já implementada como use case separado `CreateSession`). O controller orquestra os dois — mesmo padrão de composição que `RegisterUser` já não faz (mas poderia) e que este ADR não tem motivo para desviar: `CreateSession` é reutilizável por qualquer fluxo futuro que precise mintar uma sessão (ex: login social, se um dia existir).

**Por que erro específico para conta suspensa mas genérico para credenciais erradas?**
São ameaças diferentes. Enumeração de contas via senha errada é o ataque clássico que LOG-003 mitiga (tentar e-mails em massa até um retornar "senha errada" em vez de "e-mail não existe"). Suspensão já pressupõe que a plataforma conhece e decidiu sobre aquela conta — não há superfície de enumeração nova em confirmar isso para quem já sabe o e-mail e a senha corretos.

**Por que `UserNotFoundError` mapeia para 401 e não para 404?**
`GetCurrentUser` só é alcançado depois que `SessionAuthGuard` já validou uma sessão ativa — chegar a esse ponto e não achar o `User` correspondente não é um "recurso que legitimamente pode não existir" do ponto de vista do cliente (como `SessionNotFoundError` ao tentar revogar sessão de outro usuário), é uma violação de invariante (sessão não pode existir sem usuário). Tratar como `401` e limpar os cookies (mesmo comportamento de `SessionExpiredError` no `SessionAuthGuard`, ADR 0004) força o cliente a re-autenticar em vez de expor um estado inconsistente como se fosse um `404` de negócio normal.

**Por que logout sem guard e logout-all com guard?**
Logout de uma sessão específica é sobre "esquecer este cookie", uma operação que faz sentido mesmo se o cookie já não identifica nada válido — daí a idempotência exigida pela doc. Logout-all é sobre "encontre todas as sessões deste usuário", que exige saber quem é o usuário de forma confiável; sem sessão válida, não há usuário a resolver, então `401` é a resposta correta (não há nada de ambíguo ou "quase-válido" a tolerar).

---

## Mobile (`mybitcoin-app`) — Tela de Login

**Data:** 2026-08-12. Primeira integração real do mobile com a API — antes desta decisão, `mybitcoin-app` era um template Expo Router quase padrão, sem nenhuma chamada de rede, store Zustand ou estratégia de sessão. Estabelece o padrão de networking, cache e sessão que toda futura integração no mobile segue.

O front (`mybitcoin-front`) já resolve login com o fluxo descrito nas seções acima (React Router, TanStack Query, Zustand só para `kycStatus`, Axios com cookies + CSRF, react-hook-form + zod). Esta seção porta esse mesmo fluxo para o mobile, adaptado às restrições do React Native.

### Forças em Jogo (Mobile)

- A API (`apps/mybitcoin-api/src/modules/identity/presentation/sessions.controller.ts`, `session-cookies.ts`) só suporta sessão via cookie — não existe endpoint de token. Não é opção trocar a estratégia de sessão unilateralmente no mobile.
- React Native não tem `document.cookie` nem gerencia cookies automaticamente como um browser.
- Expo Router é file-based e, à época, não tinha nenhuma estrutura de grupos/stack — só as tabs renderizadas direto no layout raiz.
- RNR (React Native Reusables) não tem um componente `Field`/`FieldError` equivalente ao shadcn.
- Regras de negócio de login já implementadas na API (`docs/bussiness/02-identidade-e-acesso.md`, LOG-001 a LOG-006): apenas contas ativas autenticam, mensagem de erro não revela qual campo está errado (LOG-003), bloqueio temporário após excesso de falhas (LOG-006) — tudo isso já é tratado no `authService`/`handleApiError` do front e deve ser replicado tal como está, não redecidido aqui.

### Decisão (Mobile)

Portar o fluxo do front quase 1:1 (types, service, hooks, store), com as seguintes decisões:

**1. Sessão via cookie jar nativo.** `@preeternal/react-native-cookie-manager` (fork mantido/TurboModule do `@react-native-cookies/cookies`, que está deprecado) — API idêntica (`CookieManager.get(url)`). O RN já persiste `Set-Cookie` automaticamente no cookie jar nativo; só precisa **ler** o `__Host-csrf` pra mandar como header `X-CSRF-Token` em mutations, exatamente como o front faz com `document.cookie`.

Ponto de atenção assumido e aceito: o cookie `__Host-session`/`__Host-csrf` tem o atributo `Secure`, que exige HTTPS. Contra um backend `http://localhost:3000` em dev isso pode não persistir no cookie jar nativo. Implementado fiel ao front; se isso se confirmar um bloqueio em dev, é um ajuste de ambiente (ex: proxy HTTPS local), não uma mudança de arquitetura.

Como isso é um módulo nativo, **o app sai do Expo Go a partir desta mudança** — passa a exigir dev client (`npx expo run:android` / `run:ios`).

**Exceção justificada às convenções do projeto mobile:** a sessão (`__Host-session`) não vai para `expo-secure-store` — não é um token que a aplicação lê, guarda ou gerencia manualmente; é um cookie HTTP opaco ao JavaScript, gerenciado pelo próprio stack de rede nativo do RN. Se um dia a API expuser um token gerenciado pela app (ex: refresh token para mobile), esse token vai para `expo-secure-store`, seguindo a regra normalmente.

**Base URL da API:** `process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'` — mesma convenção do front (`VITE_API_URL ?? 'http://localhost:3000'`), adaptada ao prefixo `EXPO_PUBLIC_` que o Expo exige para expor env vars ao bundle do cliente.

**Refetch em foco/reconexão (React Native, TanStack Query):** ao contrário do browser, o TanStack Query no RN não reavalia queries automaticamente quando o app volta de background ou a rede reconecta — comportamento *opt-in* nesta plataforma. `src/lib/query-client.ts` configura `onlineManager` (via `expo-network`) e `focusManager` (via `AppState`, ignorado na web).

**2. Navegação: `Stack.Protected`** (padrão oficial do Expo Router para SDK 57, https://docs.expo.dev/router/advanced/authentication/). Reestrutura `src/app/`:

```
src/app/
├── _layout.tsx        ← RootNavigator: <Stack> com Stack.Protected guardado por useCurrentUser()
├── login.tsx           ← sempre acessível, fora do grupo protegido
└── (tabs)/
    ├── _layout.tsx     ← importa e renderiza o AppTabs (NativeTabs) já existente
    ├── index.tsx        ← movido de src/app/index.tsx (sem mudança de conteúdo)
    └── explore.tsx      ← movido de src/app/explore.tsx (sem mudança de conteúdo)
```

O gate de splash já existente (`fontsLoaded` em `_layout.tsx`) passa a esperar também `useCurrentUser()` resolver (`isPending`), pra não desenhar `login`/`(tabs)` antes de saber se há sessão.

**3. Formulário sem `Field`/`FieldError`.** RNR não tem esse primitivo. Montado manualmente com `Label` + `Input` + um `<Text>` de erro por campo — sem criar uma abstração `Field` nova (só esta tela usa isso; evita over-engineering até que um segundo formulário apareça).

**4. Brand panel sem `<img>`.** Os SVGs do front (`wave-haikei.svg`, `logo-text-horizontal-white.svg`) foram copiados para `assets/images/` e renderizados via `expo-image`.

### Rationale (Mobile)

**`Stack.Protected` vs. `if (!user)` manual:** um `if` evitaria mover arquivos, mas `login` nunca seria uma rota real — sem deep-link, sem back-button correto. `Stack.Protected` suporta deep link direto pra `/login` e redireciona automaticamente quando o guard muda (ex: logout).

**Sem Context/`useSession` próprio:** duplicaria a fonte de verdade. O front já decidiu que "quem está logado" vive **só** no cache do TanStack Query (`useCurrentUser`), nunca em um Context paralelo — o mobile segue o mesmo padrão, usando `useCurrentUser()` como fonte do guard.

### Impacto nas Áreas (Mobile)

| Área | Arquivos afetados | O que muda |
|------|------------------|-----------|
| Rotas (telas) | `src/app/_layout.tsx` (reescrito), `src/app/login.tsx` (novo), `src/app/(tabs)/_layout.tsx` (novo), `src/app/(tabs)/index.tsx` e `explore.tsx` (movidos) | Login passa a ser rota protegida por `Stack.Protected`; tabs passam a viver num grupo |
| Stores | `src/stores/use-auth-store.ts` (novo) | `kycStatus` — único estado global que não vem de fetch, igual ao front |
| Hooks | `src/hooks/use-login-mutation.ts`, `src/hooks/use-current-user.ts` (novos) | Mutation de login + query de usuário atual |
| Services | `src/services/auth.service.ts` (novo) | `login`, `logout`, `getMe` |
| Lib | `src/lib/api-client.ts`, `src/lib/api-errors.ts`, `src/lib/cookies.ts` + `.web.ts`, `src/lib/query-client.ts` (novos) | Cliente axios, mapeamento de erro pt-BR, leitura de CSRF (native/web), `QueryClient` (+ `onlineManager`/`focusManager`) |
| Types | `src/types/auth.ts`, `src/types/auth.schema.ts` (novos) | Mesmos tipos do front |
| Components | `src/components/auth/login-form.tsx`, `src/components/auth/auth-brand-panel.tsx` (novos) | Formulário e painel de marca |
| Assets | `assets/images/wave-haikei.svg`, `assets/images/logo-text-horizontal-white.svg` (copiados do front) | Brand panel |
| Config | `package.json` (8 deps novas), `.env.example` (novo) | Ver Plano de Implementação (Mobile) |

**Não incluído nesta tela:** `ThemeToggle` manual do front (mobile já segue o tema do sistema); página `/kyc` e `requiredKyc` do `ProtectedRoute` do front (não existe tela de KYC no mobile ainda).

**Decisão explícita sobre `use-auth-store.ts` sem consumidor ainda:** criar a store agora, mesmo sem nenhuma tela lendo `kycStatus` nesta tarefa, é uma exceção deliberada à regra de não antecipar estado Zustand — decisão do usuário: manter por paridade 1:1 com o front, já que a tela de KYC é o próximo ADR natural depois deste.

### Contratos de Dados (Mobile)

Idênticos aos do backend (ver seções acima): `POST /auth/login` (`{ email, password }` → `{ userId, name, email, status }`), `GET /auth/me` (→ `{ id, name, email, status }`), erro no formato `{ statusCode, code, message, details? }`.

### Estratégia de Estado (Mobile)

| Dado | Onde vive | Motivo |
|------|-----------|--------|
| Usuário autenticado | TanStack Query (`['auth','me']`, via `useCurrentUser`) | Fonte única de verdade — igual ao front |
| `kycStatus` | Zustand (`useAuthStore`) | Não vem de fetch ainda; cross-screen |
| Cookie de sessão (`__Host-session`) | Cookie jar nativo | Nunca em `AsyncStorage`/Zustand |
| CSRF token | Lido on-demand do cookie jar (`src/lib/cookies.ts`), nunca guardado em estado | Mesma vida útil do cookie |
| Estado do formulário | `react-hook-form` local | Só a tela de login usa |

### Plano de Implementação (Mobile)

0. Dependências: `axios`, `zod`, `react-hook-form`, `@hookform/resolvers`, `@tanstack/react-query`, `zustand` (JS puro) + `@preeternal/react-native-cookie-manager`, `expo-network` (via `expo install`, nativas). `.env.example` com `EXPO_PUBLIC_API_URL=http://localhost:3000`.
1. Tipos (`src/types/`): `auth.ts`, `auth.schema.ts` (idênticos ao front)
2. Lib (`src/lib/`): `api-errors.ts`, `cookies.ts`/`cookies.web.ts`, `api-client.ts`, `query-client.ts` (com `onlineManager`/`focusManager`)
3. Service (`src/services/`): `auth.service.ts`
4. Store (`src/stores/`): `use-auth-store.ts`
5. Hooks (`src/hooks/`): `use-current-user.ts`, `use-login-mutation.ts`
6. Componentes (`src/components/auth/`): `auth-brand-panel.tsx`, `login-form.tsx`
7. Rotas (`src/app/`): mover `(tabs)/index.tsx`/`explore.tsx`, criar `(tabs)/_layout.tsx` (só importa/renderiza `AppTabs` já existente), `login.tsx`, reescrever `_layout.tsx`

### Estados da UI (Mobile)

| Estado | Comportamento |
|--------|--------------|
| Loading (auth inicial) | Splash existente permanece visível até `fontsLoaded && !isPending` |
| Loading (submit do form) | Botão desabilitado, texto "Entrando..." (igual ao front) |
| Erro de validação (campo) | Texto `text-destructive` abaixo do input |
| Erro da API (`root`) | Mapeado por `handleApiError` (LOG-003 nunca revela qual campo) |
| Offline/erro de rede | `handleApiError` já cobre |
| Sucesso | Cache de `useCurrentUser` populado; `Stack.Protected` redireciona pra `(tabs)` automaticamente |

### Plataformas e Acessibilidade (Mobile)

- **Divergência por plataforma:** só em `src/lib/cookies.ts` (`.ts` native / `.web.ts` com `document.cookie`).
- **Touch targets:** `Button` do RNR já usa `h-10`/`h-11` (≥ 44px) por padrão.
- **Acessibilidade nativa:** `Label` (`@rn-primitives/label`) recebe `nativeID` e o `Input` correspondente recebe `aria-labelledby` apontando pro mesmo valor.
- **Safe area:** tela de login usa `SafeAreaView`.
- **Expo Go:** deixa de funcionar para o app inteiro a partir desta mudança (módulo nativo do cookie manager) — precisa de dev client.

### Edge Cases & Erros (Mobile)

| Caso | Comportamento decidido |
|------|----------------------|
| Credenciais inválidas | Mensagem genérica "E-mail ou senha inválidos." (LOG-003) |
| Conta suspensa | "Sua conta foi suspensa. Entre em contato com o suporte." |
| Excesso de tentativas (LOG-006) | "Muitas tentativas de login. Tente novamente em alguns minutos." |
| Sem rede / API fora do ar | "Erro de conexão. Verifique sua internet." |
| Usuário já autenticado abre `/login` | `Stack.Protected` redireciona pra `(tabs)` automaticamente |
| App reaberto com sessão válida | `useCurrentUser` resolve com usuário → entra direto em `(tabs)` |
| Cookie `Secure` rejeitado contra `http://localhost` em dev | Risco conhecido — não tratado como bug de código |

### Consequências (Mobile)

**Positivas:** estabelece o padrão de networking (axios + TanStack Query + api-errors) que toda integração futura no mobile reusa; sessão idêntica à do front, zero mudança no backend.

**Negativas / Trade-offs:** app sai do Expo Go a partir de agora (módulo nativo de cookie); cookies `Secure` podem não persistir contra backend `http://` em dev no dispositivo/emulador.

### Decisões do Usuário (Mobile)

- 2026-08-12 — "Como tratar sessão/autenticação no mobile?" → Cookie jar nativo, fiel ao front (não token).
- 2026-08-12 — Confirmado: não portar `ThemeToggle` manual (mobile já segue tema do sistema).
- 2026-08-12 — Confirmado: montar formulário manualmente (sem `Field`), já que RNR não tem esse primitivo e só há um formulário até agora.
- 2026-08-12 — "Criar `use-auth-store.ts` (`kycStatus`) mesmo sem consumidor nesta tarefa?" → Manter, por paridade 1:1 com o front.

### Validação (Mobile, Estágio 2) — 2026-08-12

**Veredito:** 🔁 REVISAR — 2 gaps ALTO (falta passo de instalar dependências; falta tratar refetch em foco/reconexão do TanStack Query no RN), 4 gaps MÉDIO (base URL sem fonte definida; divergência não reconhecida da regra `expo-secure-store`; `use-auth-store.ts` sem consumidor; mecanismo de acessibilidade divergente do padrão da lib instalada). Todos corrigidos na revalidação abaixo — ver decisões incorporadas nas seções "Decisão (Mobile)", "Plano de Implementação (Mobile)" e "Plataformas e Acessibilidade (Mobile)" acima.

### Validação (Mobile, Estágio 2, revalidação) — 2026-08-12

**Veredito:** ✅ **APROVA** — os 2 gaps ALTO e os 4 MÉDIO da rodada anterior foram fechados e reverificados contra o código/documentação real (dependências existentes no npm registry, `Stack.Protected` confirmado em `expo-router@57.0.11`, API real de `@rn-primitives/label`). 3 gaps BAIXO remanescentes eram só precisão de texto (contagem de dependências, imprecisão sobre qual lib exige rebuild), sem impacto de arquitetura — corrigidos.

### Referências (Mobile)

- `apps/mybitcoin-front/src/pages/login-page.tsx`, `src/components/auth/*`, `src/types/auth*.ts`, `src/services/auth.service.ts`, `src/lib/api-client.ts`, `src/lib/api-errors.ts`, `src/hooks/use-login-mutation.ts`, `src/hooks/use-current-user.ts`, `src/stores/use-auth-store.ts`, `src/components/protected-route.tsx`, `src/App.tsx`
- `apps/mybitcoin-api/src/modules/identity/presentation/sessions.controller.ts`, `session-cookies.ts`
- `docs/bussiness/02-identidade-e-acesso.md` (LOG-001 a LOG-006)
- https://docs.expo.dev/router/advanced/authentication/ (padrão `Stack.Protected`, SDK 57)

---

## Impacto nos Bounded Contexts

| Bounded Context | Impacto | Como se comunica |
|----------------|---------|-----------------|
| identity | Novos use cases `Login`, `Logout`, `GetCurrentUser`; novos erros `InvalidCredentialsError`, `AccountSuspendedError`, `UserNotFoundError`; consome `CreateSession`/`RevokeAllSessions`/cookies do ADR 0004 | Import direto (mesmo módulo) |
| financial | Nenhum | — |
| shared | `DomainError` reutilizado | Import |
| infrastructure (compartilhada) | `DomainErrorFilter` (ADR 0004) ganha 3 novas entradas no mapa código→status | Edição do arquivo existente |
| frontend web (`mybitcoin-front`) | Bootstrap de roteador, cliente HTTP, service de auth, página de login, store sem campo `token` | Novo projeto consumidor da API |
| mobile (`mybitcoin-app`) | Bootstrap de networking (axios/TanStack Query), sessão via cookie jar nativo, `Stack.Protected`, telas/hooks/store de auth | Novo projeto consumidor da API |

**Entidades de domínio afetadas:** nenhuma nova (reutiliza `User`, `Session` existentes)
**Domain Events:** nenhum novo — `Login` não cria evento (falha de login não é fato de domínio auditável via evento neste ADR, ver decisão de auditoria por log); `Logout`/`RevokeAllSessions` reusam `SessionRevoked` (ADR 0004)
**Interfaces de repositório afetadas:** nenhuma nova — `UserRepository`, `UserReadRepository`, `SessionRepository` já têm os métodos necessários
**Migrations necessárias:** não (backend). Mobile: nenhuma (sem persistência própria além do cookie jar nativo).

---

## Checklist de Arquitetura

- [x] Nenhum arquivo em `identity/domain/` importa de `identity/infrastructure/` ou `identity/presentation/`
- [x] Valores monetários usam `BIGINT`/`bigint` — não aplicável (sem valores financeiros)
- [x] Erros de domínio são subclasses de `DomainError` (`InvalidCredentialsError`, `AccountSuspendedError`, `UserNotFoundError`)
- [x] Operações multi-tabela usam `UnitOfWork` — não aplicável (cada use case toca uma única tabela: `Login` só lê `users`; `Logout`/`RevokeAllSessions` só escrevem `sessions`)
- [x] Entidades não recebem dependências de infraestrutura no construtor — `comparePassword` é injetado no use case (application), igual ao padrão de `hashPassword` em `RegisterUser`

---

## Plano de Implementação

### 1. Domínio (`src/modules/identity/domain/`)
- [ ] Erro `InvalidCredentialsError` — `errors/invalid-credentials.error.ts` (`code = 'INVALID_CREDENTIALS'`, construtor sem parâmetros, mensagem estática `'Invalid email or password'` — **nunca interpolar e-mail/senha/qualquer dado do request**)
- [ ] Erro `AccountSuspendedError` — `errors/account-suspended.error.ts` (`code = 'ACCOUNT_SUSPENDED'`, construtor recebe `userId` só para log, mensagem estática `'This account has been suspended'` sem o `userId`)
- [ ] Erro `UserNotFoundError` — `errors/user-not-found.error.ts` (`code = 'USER_NOT_FOUND'`, construtor recebe `userId` só para log, mensagem estática `'User not found'`)

### 2. Aplicação (`src/modules/identity/application/`)
- [ ] Use Case `Login` — `login.usecase.ts` (email/senha → dados do usuário; erros conforme fluxo descrito na Decisão)
- [ ] Use Case `Logout` — `logout.usecase.ts` (token em claro → revoga sessão por hash, idempotente, nunca lança erro)
- [ ] Use Case `GetCurrentUser` — `get-current-user.usecase.ts` (userId → dados do usuário via `UserReadRepository`; `findById` retornando `null` lança `UserNotFoundError`, ver Edge Cases)

### 3. Infraestrutura (`src/modules/identity/infrastructure/`, `src/infrastructure/http/`)
- [ ] Nenhuma migration nova
- [ ] `DomainErrorFilter` (`src/infrastructure/http/domain-error.filter.ts`): adicionar `INVALID_CREDENTIALS` → 401, `ACCOUNT_SUSPENDED` → 403 e `USER_NOT_FOUND` → 401 ao mapa existente

### 4. Presentation (`src/modules/identity/presentation/`)
- [ ] DTO `LoginDto` — `dto/login.dto.ts` (`email`, `password`)
- [ ] DTO `LoginResponseDto` — `dto/login-response.dto.ts` (`userId`, `name`, `email`, `status`)
- [ ] DTO `MeResponseDto` — `dto/me-response.dto.ts` (`id`, `name`, `email`, `status`)
- [ ] `identity.module.ts`: registrar `Login` (inject `UserRepository` + `comparePassword: (plain, hash) => bcrypt.compare(plain, hash)`), `Logout` (inject `SessionRepository`), `GetCurrentUser` (inject `UserReadRepository`)
- [ ] `identity.controller.ts`:
  - [ ] `POST /auth/login` — chama `Login` → `CreateSession` → `setSessionCookies` → `200`
  - [ ] `POST /auth/logout` — sem guard, lê cookie diretamente → `Logout` → `clearSessionCookies` → `204` sempre
  - [ ] `POST /auth/logout-all` — `@UseGuards(SessionAuthGuard)` → `RevokeAllSessions({ reason: 'logout_all' })` → `clearSessionCookies` → `204`
  - [ ] `GET /auth/me` — `@UseGuards(SessionAuthGuard)` → `GetCurrentUser` → `200`
  - [ ] Log estruturado (LOG-005) em cada branch de `POST /auth/login` (início, sucesso, credenciais inválidas, conta suspensa)
- [ ] Swagger: exemplos de sucesso e erro para os 4 endpoints, seguindo o padrão de `register` (`@ApiOperation`, `@ApiOkResponse`, `@ApiUnauthorizedResponse`, `@ApiForbiddenResponse`)

### 5. Frontend Web (`apps/mybitcoin-front/src/`)
- [ ] `lib/api-client.ts` — wrapper `fetch` com `credentials: 'include'`, injeção de `X-CSRF-Token` em métodos mutantes, integração com `ApiError`/`parseApiError` existentes
- [ ] `services/auth.service.ts` — `login`, `logout`, `logoutAll`, `getMe`
- [ ] `stores/use-auth-store.ts` — remover campo `token`
- [ ] `App.tsx` — configurar `react-router-dom` (`createBrowserRouter`), rota pública `/login`, rota protegida mínima de exemplo
- [ ] `pages/login-page.tsx` — formulário de login, integração com `authService.login` + `useAuthStore`
- [ ] Bootstrap de sessão no carregamento da app — chama `getMe()`, popula ou limpa `useAuthStore`, `setLoading(false)` ao final

### 6. Mobile (`apps/mybitcoin-app/`)

Ver "Plano de Implementação (Mobile)" na seção "Mobile (`mybitcoin-app`) — Tela de Login" acima.

---

## Edge Cases & Erros de Domínio

| Caso | Erro de domínio | Comportamento decidido |
|------|----------------|----------------------|
| E-mail não cadastrado | `InvalidCredentialsError` | `401`, mensagem genérica (LOG-003) |
| Senha incorreta | `InvalidCredentialsError` | `401`, mesma mensagem genérica do caso anterior |
| E-mail com formato inválido | `InvalidEmailError` (já existe, ADR 0002) | `422` — validação de formato, não é vazamento de LOG-003 |
| Conta `SUSPENDED` | `AccountSuspendedError` | `403`, mensagem específica |
| Conta `PENDING_EMAIL_VERIFICATION` | — | Login permitido (LOG-002 relaxado, ver Rationale) |
| Conta `ACTIVE` | — | Login permitido |
| MFA habilitado (LOG-004) | — | Fora de escopo — MFA não existe no projeto; não implementado |
| Excesso de tentativas (LOG-006) | — | Implementado numa emenda posterior (ver "Emenda (pós-implementação)") |
| Logout sem cookie de sessão | — (nunca lança) | `204` idempotente, cookies limpos de qualquer forma |
| Logout com sessão já expirada/revogada | — (nunca lança) | `204` idempotente |
| Logout-all sem sessão válida | — (guard rejeita antes do use case) | `401` |
| `GET /auth/me` sem sessão válida | — (guard rejeita antes do use case) | `401` |
| `GET /auth/me` com sessão válida mas `userId` não resolve para um `User` existente (`UserReadRepository.findById` → `null`) | `UserNotFoundError` | `401`, cookies limpos — tratado como invariante quebrada (sessão não pode existir sem usuário), não como 404 de negócio normal (ver Rationale) |

(Edge cases específicos do mobile: ver "Edge Cases & Erros (Mobile)" acima.)

---

## Plano de Teste

- [ ] Unit (use case `Login`): credenciais válidas + status `ACTIVE` → sucesso; credenciais válidas + `PENDING_EMAIL_VERIFICATION` → sucesso; e-mail inexistente → `InvalidCredentialsError`; senha errada → `InvalidCredentialsError` (mesma classe/mensagem dos dois casos); conta `SUSPENDED` → `AccountSuspendedError`
- [ ] Unit (use case `Logout`): token válido de sessão ativa → revoga e retorna evento; token de sessão já revogada → não lança, `event: null`; token inexistente → não lança, `event: null`
- [ ] Unit (use case `GetCurrentUser`): userId existente → retorna dados; userId inexistente (`UserReadRepository.findById` retorna `null`) → `UserNotFoundError`
- [ ] Unit (erros `InvalidCredentialsError`/`AccountSuspendedError`/`UserNotFoundError`): mensagem é estática e não contém e-mail/senha/UUID interpolado — teste de regressão direto contra o gap 1/2 da validação (ex.: `expect(new InvalidCredentialsError().message).toBe('Invalid email or password')`, o mesmo texto independente do que causou o erro)
- [ ] Unit (`DomainErrorFilter`): `INVALID_CREDENTIALS` → 401, `ACCOUNT_SUSPENDED` → 403, `USER_NOT_FOUND` → 401
- [ ] Integração (`identity.controller`, `POST /auth/login`): fluxo completo com banco real — sucesso seta os dois cookies (`__Host-session` httpOnly, `__Host-csrf` não-httpOnly); falha não seta cookie nenhum
- [ ] Integração (`POST /auth/logout`): com sessão válida → revoga no banco, limpa cookies, `204`; sem cookie → `204` sem tocar o banco; com cookie de sessão já revogada → `204`
- [ ] Integração (`POST /auth/logout-all`): revoga todas as sessões ativas do usuário (`findActiveByUserId` retorna vazio depois); sem sessão válida → `401`
- [ ] Integração (`GET /auth/me`): sessão válida → retorna dados do usuário; sem sessão → `401`
- [ ] Negativo: tentativas de login com e-mail de outro usuário existente + senha aleatória não devem distinguir erro do caso "e-mail não existe" (mesmo `code`/mensagem)

---

## Fluxos

```
1. POST /auth/login { email, password }
   → Login.execute() → valida credenciais, status da conta
   → Sucesso: CreateSession.execute({ userId, deviceInfo, ipAddress })
   → setSessionCookies(response, { token, expiresAt })
   → Log estruturado (sucesso)
   → 200 { userId, name, email, status }

   → Falha (credenciais): Log estruturado (falha) → 401 INVALID_CREDENTIALS
   → Falha (suspenso): Log estruturado (falha) → 403 ACCOUNT_SUSPENDED

2. POST /auth/logout
   → Lê cookie __Host-session diretamente (sem guard)
   → Logout.execute({ token }) — nunca lança
   → clearSessionCookies(response)
   → 204 (sempre)

3. POST /auth/logout-all
   → SessionAuthGuard valida sessão, popula request.user
   → RevokeAllSessions.execute({ userId, reason: 'logout_all' })
   → clearSessionCookies(response)
   → 204

4. GET /auth/me
   → SessionAuthGuard valida sessão, popula request.user
   → GetCurrentUser.execute({ userId })
   → 200 { id, name, email, status }

5. (Frontend Web / Mobile) Carregamento da aplicação
   → authService.getMe()
   → Sucesso: useAuthStore.setUser(user) / cache de useCurrentUser populado
   → Falha (401): useAuthStore.setUser(null)
   → useAuthStore.setLoading(false)
```

---

## Consequências

**Positivas:**
- Fecha o fluxo de autenticação de ponta a ponta (cadastro → login → sessão protegida → logout), consumindo 100% da infraestrutura já pronta do ADR 0004 sem reabrir nenhuma decisão de segurança
- Erro genérico para credenciais inválidas fecha a superfície de enumeração de contas via login (LOG-003)
- `Logout` idempotente elimina uma classe inteira de bugs de frontend (race condition entre múltiplas abas fazendo logout simultâneo, retry após timeout)
- `mybitcoin-front` sai do boilerplate para uma base mínima funcional (roteador, cliente HTTP, fluxo de auth real)
- `mybitcoin-app` estabelece o padrão de networking (axios + TanStack Query + api-errors) que toda integração futura no mobile reusa, com sessão idêntica à do front e zero mudança no backend

**Negativas / Trade-offs:**
- LOG-002 relaxado é uma divergência documentada, não uma implementação completa da regra — precisa ser revisitada (endurecida de volta) quando Verificação de E-mail for implementada; risco de esquecimento se não houver um lembrete além deste ADR
- LOG-004 (MFA) fica sem nenhuma proteção — aceitável para o estágio atual do projeto, mas é uma lacuna de segurança real, não apenas teórica (LOG-006, lockout por tentativas, foi endereçado numa emenda posterior)
- Auditoria via log estruturado (não persistida em tabela/evento consultável) significa que investigar tentativas de login históricas depende de um sistema de agregação de logs externo, que o projeto não tem hoje
- Escopo de frontend maior que "só login/logout": inclui bootstrap de roteador e cliente HTTP que qualquer feature futura de UI também precisaria — decisão consciente de fazer uma vez aqui em vez de cada feature reinventar
- Mobile sai do Expo Go a partir desta mudança (módulo nativo de cookie) — todo teste local passa a exigir dev client; cookies `Secure` podem não persistir contra backend `http://` em dev

---

## Decisões do Usuário

> Confirmadas no grelhamento (Passo 2 da skill). Não são suposições do arquiteto.

- 2026-08-01 — Escopo desta pipeline → Login + Logout (Recuperação de Senha, Verificação de E-mail, KYC, MFA ficam fora)
- 2026-08-01 — LOG-002 (email verificado obrigatório) → Relaxado: login permitido tanto para `ACTIVE` quanto `PENDING_EMAIL_VERIFICATION`, decisão reversível quando Verificação de E-mail existir
- 2026-08-01 — Endpoint de perfil → Incluir `GET /auth/me` neste ADR (necessário para o frontend restaurar sessão no reload)
- 2026-08-01 — Auditoria de LOG-005 → Log estruturado (padrão de `RegisterUser`), sem tabela nova
- 2026-08-01 — `reason` do logout global em `RevokeAllSessions` → Novo valor `'logout_all'` (já previsto como extensão no ADR 0004)
- 2026-08-01 — Campo `token` no `useAuthStore` do frontend → Remover (sessão é 100% cookie `httpOnly`, JS nunca tem acesso ao token)
- 2026-08-01 — Conta suspensa no login → Erro específico `AccountSuspendedError` (403), não o erro genérico de credenciais
- 2026-08-01 — Idempotência do logout de sessão única → `POST /auth/logout` sem `SessionAuthGuard`, sempre `204`, mesmo sem cookie válido
- 2026-08-01 — Escopo do frontend → Bootstrap completo (roteador + cliente HTTP + página de login), não só camada de integração
- 2026-08-01 — Gap 4 da validação (login CSRF / fixação de sessão via form POST cross-site em `POST /auth/login`, sem CSRF possível porque não há sessão prévia) → Aceito como fora de escopo deste ADR, mesma categoria de risco já aceito para LOG-004/LOG-006. Não bloqueia aprovação
- (Mobile) 2026-08-12 — "Como tratar sessão/autenticação no mobile?" → Cookie jar nativo, fiel ao front (não token)
- (Mobile) 2026-08-12 — Confirmado: não portar `ThemeToggle` manual (mobile já segue tema do sistema)
- (Mobile) 2026-08-12 — Confirmado: montar formulário manualmente (sem `Field`), já que RNR não tem esse primitivo e só há um formulário até agora
- (Mobile) 2026-08-12 — "Criar `use-auth-store.ts` (`kycStatus`) mesmo sem consumidor nesta tarefa?" → Manter, por paridade 1:1 com o front

---

## Referências

- ADR 0002 — Identity: Cadastro de Usuários
- ADR 0004 — Transporte de Sessão via Cookie httpOnly
- `docs/bussiness/02-identidade-e-acesso.md` — Regras LOG-001 a LOG-006, OUT-001 a OUT-003
- `docs/architecture/02-clean-architecture-ddd-fundamentos.md` — Princípios
- `docs/architecture/03-estrutura-projeto.md` — Estrutura de pastas
- (Mobile) ver "Referências (Mobile)" na seção "Mobile (`mybitcoin-app`) — Tela de Login" acima

---

## Validação (Estágio 2) — 2026-08-01

### Veredito: 🔁 REVISAR

### Checklist

| Bloco | Item | Status | Evidência |
|---|---|---|---|
| A. Regra de Dependência | `Login`/`Logout`/`GetCurrentUser` não importam infra/presentation | OK | Plano de Implementação descreve os três como classes de `application/` recebendo apenas interfaces de domínio (`UserRepository`, `SessionRepository`, `UserReadRepository`) e uma função injetada (`comparePassword`), mesmo padrão de `hashPassword` em `RegisterUser` (`register-user.usecase.ts:15-19`) |
| A. Regra de Dependência | Repositórios acessados só via interface de domínio | OK | `UserRepository`, `SessionRepository`, `UserReadRepository` já existem como abstract classes em `domain/repositories/`; nenhuma query nova, nenhum SQL inline proposto |
| B. Modelagem DDD | Entidades com identidade clara | N/A | Nenhuma entidade nova — reusa `User`/`Session` |
| B. Value Objects | Conceitos sem identidade cobertos | OK | Reusa `Email`, `UserId`, `UserStatus` existentes; não precisa de VO novo |
| B. Invariantes no aggregate | — | N/A | Nenhuma invariante nova de `User`/`Session` introduzida |
| B. Domain Events | Fatos relevantes emitem evento | OK, com nota | `Logout` reusa `SessionRevoked` (ADR 0004); `Login` conscientemente não emite evento (decisão documentada na seção "Rationale" e em "Decisões do Usuário" — auditoria via log estruturado). Coerente, não é omissão silenciosa |
| **B. Erros tipados — mensagem não deve vazar informação que a própria regra pretende esconder** | — | **GAP — ALTO** | O padrão já estabelecido no módulo embute o valor recebido na mensagem do erro, que é devolvida ao cliente **verbatim** por `DomainErrorFilter` (`domain-error.filter.ts:22`: `response.status(status).json({ code: error.code, message: error.message })`) — ver `EmailAlreadyExistsError` (`super(\`Email '${email}' is already registered\`)`) e `SessionNotFoundError` (`super(\`Session '${sessionId}' not found\`)`). O ADR especifica que `InvalidCredentialsError` deve ser **o mesmo erro** para "e-mail não encontrado" e "senha errada" (LOG-003, seção Decisão item 3), mas não diz explicitamente que a mensagem **não pode conter o e-mail informado** nem qualquer dado que distinga os dois casos |
| **B. Erros tipados — `AccountSuspendedError` expõe identificador interno ao cliente** | — | **GAP — MÉDIO** | Mesma mecânica do gap acima: se `AccountSuspendedError` seguir o padrão de `SessionNotFoundError(sessionId)` e embutir `userId` (UUID interno) na mensagem, esse UUID vaza para a resposta HTTP sem necessidade |
| C. Precisão monetária | — | N/A | Nenhum valor monetário |
| D. UnitOfWork/atomicidade | `Login` só lê, `Logout`/`RevokeAllSessions` só escrevem em `sessions` (tabela única) | OK | Nenhuma operação multi-tabela proposta |
| **D. Consistência de leitura (ADR 0003)** | `Login` usa repositório de escrita (não a réplica) para checar credenciais | OK, verificado | ADR 0003 (`0003-read-write-database-replication.md:395`) recomenda explicitamente usar o repositório de escrita quando é preciso ler consistente com a última escrita — correto, evita falso `InvalidCredentialsError` por lag de réplica logo após um cadastro |
| E. Schema | Nenhuma migration | OK | Confirmado — nenhuma coluna/tabela nova necessária para Login/Logout/`GET /auth/me` |
| F. Edge cases — registro inexistente | — | OK | Tabela de Edge Cases cobre e-mail não cadastrado, senha incorreta, conta suspensa |
| **F. Edge cases — `GetCurrentUser` quando `findById` retorna `null`** | — | **GAP — MÉDIO** | A convenção do projeto implica que `UserReadRepository.findById` pode retornar `null`, sem decisão explícita na tabela de Edge Cases |
| F. Edge cases — operação duplicada/idempotência | Logout idempotente | OK | Coberto explicitamente (token ausente/inválido/já revogado → sempre 204, nunca lança) |
| G. Plano de teste | Cobre os edge cases do ADR | OK, com a lacuna do gap acima | Cenários de `Login`/`Logout`/`DomainErrorFilter`/integração cobertos; faltava apenas o cenário de `GetCurrentUser` com usuário não encontrado |
| H. Plano de implementação | Ordem domain → application → infra → presentation → frontend | OK | Seções seguem essa ordem |

### Gaps (ordenados por severidade)

| # | Severidade | Gap | Correção exigida |
|---|---|---|---|
| 1 | ALTO | `InvalidCredentialsError` sem mensagem estática especificada | Mensagem estática, sem interpolação, ex.: `super('Invalid email or password')` |
| 2 | MÉDIO | `AccountSuspendedError` sem mensagem especificada | Mensagem sem UUID interno, ex.: `super('This account has been suspended')` |
| 3 | MÉDIO | `GetCurrentUser` sem decisão de erro tipado para `findById` retornando `null` | Novo erro tipado (`UserNotFoundError`), mapeado a 401 |
| 4 | BAIXO (aceito, registrar) | `POST /auth/login` sem proteção contra "login CSRF" | Aceito explicitamente como fora de escopo |

### Próximo passo

Rode `/adr-architect` para amendar o ADR endereçando os gaps ALTO/MÉDIO. Depois, re-valide.

---

## Emenda (pós-Estágio 2) — 2026-08-01

Amenda aplicada pelo `/adr-architect` endereçando os gaps do Estágio 2:

| Gap | Status | O que mudou |
|---|---|---|
| 1 (ALTO — `InvalidCredentialsError` podia vazar e-mail via mensagem) | Corrigido | Construtor sem parâmetros, mensagem estática `'Invalid email or password'`, idêntica para "e-mail não encontrado" e "senha errada" |
| 2 (MÉDIO — `AccountSuspendedError` podia vazar `userId`) | Corrigido | Construtor recebe `userId` só para log estruturado; mensagem exposta ao cliente é estática, sem o UUID |
| 3 (MÉDIO — `GetCurrentUser` sem decisão para usuário não encontrado) | Corrigido | Novo erro `UserNotFoundError` (`code = 'USER_NOT_FOUND'`), mapeado a `401` no `DomainErrorFilter`, com Rationale explicando por que `401` e não `404` |
| 4 (BAIXO — login CSRF) | Aceito, sem correção | Registrado explicitamente em "Decisões do Usuário" como risco aceito |

**Próximo passo:** rode `/adr-validator` novamente sobre este ADR para confirmar que os gaps foram endereçados antes de `/adr-executor`.

---

## Validação (Estágio 2, 2ª rodada) — 2026-08-01

**Veredito:** ✅ **APROVA (com 4 gaps MÉDIO de propagação textual)**

Os 3 gaps bloqueantes da 1ª rodada (ALTO/MÉDIO) foram confirmados corrigidos: `InvalidCredentialsError` com mensagem estática, `AccountSuspendedError` sem UUID exposto, `UserNotFoundError` novo cobrindo o edge case de `GetCurrentUser`. O gap 4 (BAIXO — login CSRF) segue aceito e registrado.

**Gap novo (não bloqueante):** a emenda adicionou `UserNotFoundError` à seção "Decisão", ao Rationale, à tabela de Edge Cases e ao Plano de Teste, mas não propagou para "Impacto nos Bounded Contexts", "Checklist de Arquitetura" e o item 3 do "Plano de Implementação" — o mais acionável dos quatro, por ser o checklist literal que o executor segue.

## Correção aplicada — 2026-08-01

Os 4 pontos de propagação foram corrigidos nesta mesma passada: "Impacto nos Bounded Contexts" agora lista os 3 erros novos e "3 novas entradas" no filtro; "Checklist de Arquitetura" lista os 3 erros; item 3 do Plano de Implementação inclui `USER_NOT_FOUND → 401`.

Nenhum gap pendente. **ADR pronto para `/adr-executor`.**

---

## Emenda (pós-implementação) — 2026-08-03

O `/security-guard` (Etapa 7 da pipeline) encontrou 2 itens ALTO/MÉDIO além do já aceito (item 4 acima) e do já registrado (relaxamento de LOG-001/002): LOG-006 (sem bloqueio por tentativas) e `ValidationPipe` global ausente. Ambos foram implementados nesta emenda.

### LOG-006 — bloqueio por excesso de tentativas

**Decisões do grelhamento (2026-08-03):**
- Redis como front-line de rate-limit foi cogitado e **rejeitado por ora** — introduzir Redis é uma peça de infraestrutura nova (mesmo porte da réplica de leitura do ADR 0003) e merece seu próprio ADR quando o volume justificar. Fica registrado como débito/otimização futura, não implementado aqui.
- Armazenamento: tabela `login_attempts` (append-only), não colunas mutáveis em `users` — também fortalece LOG-005 (histórico de tentativas consultável via SQL, hoje só coberto por log estruturado).
- Limiar: 5 tentativas falhas / bloqueio de 15 min.
- Reset do contador: só em login bem-sucedido — o bloqueio é **derivado por query** (falhas desde o último sucesso, sem coluna `locked_until`), então tentativas bloqueadas nunca são gravadas e não estendem o bloqueio; só uma nova tentativa real (após o bloqueio expirar) pode empurrar o limite de novo.
- Chave do bloqueio: email normalizado, não `userId` — emails inexistentes acumulam o mesmo estado de bloqueio que contas reais, para não abrir um canal lateral que revele existência de conta (LOG-003). `TooManyLoginAttemptsError` (429) tem mensagem estática e genérica pela mesma razão.
- Conta suspensa não passa pelo contador de LOG-006 (já está bloqueada por outro motivo).

**Novos artefatos:** `domain/entities/login-attempt.entity.ts`, `domain/repositories/login-attempt.repository.ts`, `domain/services/login-lockout-policy.ts`, `domain/errors/too-many-login-attempts.error.ts`, `infrastructure/persistence/login-attempt.sql.ts` + `pg-login-attempt.repository.ts`, migration `1785780460632_create_login_attempts_table.sql` (`user_id` com `ON DELETE SET NULL` — exclusão de usuário preserva o histórico de auditoria). `Login` passa a receber `LoginAttemptRepository` no construtor e `ipAddress` no input.

### `ValidationPipe` global (item 3 do security-guard)

Adicionado `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))` em `main.ts`. Efeito colateral encontrado e corrigido: `ConfirmDepositInputDTO` (módulo `financial`) não tinha nenhum decorator `class-validator` — com `whitelist`/`forbidNonWhitelisted` ativados globalmente, os campos seriam descartados/rejeitados silenciosamente em produção (nenhum teste de integração via HTTP cobria esse endpoint, então o `pnpm test` não pegaria isso). Adicionados `@IsUUID()` em `transactionId` e `@IsInt() @Min(0)` em `confirmations`. Auditoria confirmou que nenhum outro DTO de entrada do projeto está sem validador.

**Testes:** `login.usecase.spec.ts` ganhou a suíte `LOG-006 — bloqueio por excesso de tentativas` (registro de tentativa com/sem `userId`, bloqueio ativo, bloqueio expirado, não-bloqueio para email inexistente não distinguível de conta real). 175 testes verdes (API), build real (`tsconfig.build.json`) limpo.
