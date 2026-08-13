# ADR 0001 — Tela de login (primeira integração real com a API)

**Status:** Aceito
**Data:** 2026-08-12
**Área:** autenticação
**Gerado por:** skill `/adr-architect`

---

## Contexto

O mobile ainda não tem nenhuma chamada de rede, nenhuma store Zustand e nenhuma estratégia de sessão — é um template Expo Router quase padrão (ver `CLAUDE.md`, seção "Project context"). Esta tarefa pede a tela de login **igual à do `../mybitcoin-front`**, que já tem o fluxo completo e funcionando contra a API real (`../mybitcoin-api`).

Como é a primeira vez que o app fala com a API, esta decisão não é só "criar uma tela" — ela estabelece o padrão de networking, cache e sessão que toda futura integração no mobile vai seguir.

O front resolve login com: React Router (`/login` sempre acessível + `ProtectedRoute` nas demais rotas), TanStack Query (`useCurrentUser` = fonte da verdade de quem está logado), Zustand só para `kycStatus` (não vem de fetch), Axios com `withCredentials` + cookie `__Host-session` (httpOnly) + `__Host-csrf` (lido de `document.cookie` e enviado como header em mutations), react-hook-form + zod, e shadcn `Field`/`Card`.

---

## Forças em Jogo

- A API (`../mybitcoin-api/src/modules/identity/presentation/sessions.controller.ts`, `session-cookies.ts`) só suporta sessão via cookie — não existe endpoint de token. Não é opção trocar a estratégia de sessão unilateralmente no mobile.
- React Native não tem `document.cookie` nem gerencia cookies automaticamente como um browser.
- Expo Router é file-based e hoje (`src/app/index.tsx`, `src/app/explore.tsx`) não tem nenhuma estrutura de grupos/stack — só as tabs renderizadas direto no layout raiz.
- RNR (React Native Reusables) não tem um componente `Field`/`FieldError` equivalente ao shadcn.
- Regras de negócio de login já implementadas na API (`../mybitcoin-api/docs/bussiness/02-identidade-e-acesso.md`, LOG-001 a LOG-006): apenas contas ativas autenticam, mensagem de erro não revela qual campo está errado (LOG-003), bloqueio temporário após excesso de falhas (LOG-006) — tudo isso já é tratado no `authService`/`handleApiError` do front e deve ser replicado tal como está, não redecidido aqui.

---

## Decisão

Portar o fluxo do front quase 1:1 (types, service, hooks, store), com as seguintes decisões:

### 1. Sessão via cookie jar nativo

`@preeternal/react-native-cookie-manager` (fork mantido/TurboModule do `@react-native-cookies/cookies`, que está deprecado) — API idêntica (`CookieManager.get(url)`). O RN já persiste `Set-Cookie` automaticamente no cookie jar nativo; só precisamos **ler** o `__Host-csrf` pra mandar como header `X-CSRF-Token` em mutations, exatamente como o front faz com `document.cookie`.

Ponto de atenção assumido e aceito: o cookie `__Host-session`/`__Host-csrf` tem o atributo `Secure`, que exige HTTPS. Contra um backend `http://localhost:3000` em dev isso pode não persistir no cookie jar nativo (browsers tratam `localhost` como contexto seguro; o stack de rede nativo do RN pode não ter essa exceção). Vamos implementar fiel ao front agora; se isso se confirmar um bloqueio em dev, é um ajuste de ambiente (ex: proxy HTTPS local), não uma mudança de arquitetura — trato como risco conhecido, não gap.

Como isso é um módulo nativo, **o app sai do Expo Go a partir desta mudança** — passa a exigir dev client (`npx expo run:android` / `run:ios`).

**Exceção justificada à regra do `CLAUDE.md`:** a seção "Target folder structure" do `CLAUDE.md` diz "Tokens/session → `expo-secure-store`, never `AsyncStorage` in plaintext". Esta decisão não viola essa regra por omissão — abre uma exceção explícita e justificada: o `__Host-session` não é um token que a aplicação lê, guarda ou gerencia manualmente; é um cookie HTTP opaco ao JavaScript, gerenciado pelo próprio stack de rede nativo do RN (fora do alcance de `AsyncStorage` ou `expo-secure-store`, que só fariam sentido para um valor que o código da app manipula diretamente). Se um dia a API expuser um token gerenciado pela app (ex: refresh token para mobile), esse token vai para `expo-secure-store`, seguindo a regra normalmente.

**Base URL da API:** `process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'` — mesma convenção do front (`VITE_API_URL ?? 'http://localhost:3000'`), adaptada ao prefixo `EXPO_PUBLIC_` que o Expo exige para expor env vars ao bundle do cliente. Não existe `.env`/`.env.example` no repo hoje — criar `.env.example` com `EXPO_PUBLIC_API_URL=http://localhost:3000` como parte do passo 0 de implementação.

**Refetch em foco/reconexão (React Native, TanStack Query):** ao contrário do browser, o TanStack Query no RN não reavalia queries automaticamente quando o app volta de background ou a rede reconecta — isso é comportamento *opt-in* nesta plataforma (doc oficial, seções "Online status management" e "Refetch on App focus": https://tanstack.com/query/latest/docs/framework/react/react-native). Sem isso, reabrir o app depois de matar o processo poderia mostrar `useCurrentUser` desatualizado por mais tempo que o necessário. `src/lib/query-client.ts` configura:
- `onlineManager.setEventListener` usando `expo-network` (`Network.addNetworkStateListener`) — evita adicionar `@react-native-community/netinfo` como dependência nativa extra, já que `expo-network` é do próprio ecossistema Expo.
- `focusManager.setFocused` a partir do evento `change` do `AppState` (ignorado em `Platform.OS === 'web'`, onde o comportamento de foco do browser já funciona nativamente).

### 2. Navegação: `Stack.Protected` (padrão oficial do Expo Router para SDK 57)

Confirmado em https://docs.expo.dev/router/advanced/authentication/ (lido nesta sessão, per `AGENTS.md`). Reestrutura `src/app/`:

```
src/app/
├── _layout.tsx        ← RootNavigator: <Stack> com Stack.Protected guardado por useCurrentUser()
├── login.tsx           ← sempre acessível, fora do grupo protegido
└── (tabs)/
    ├── _layout.tsx     ← novo: importa e renderiza o AppTabs (NativeTabs) já existente
    ├── index.tsx        ← movido de src/app/index.tsx (sem mudança de conteúdo)
    └── explore.tsx      ← movido de src/app/explore.tsx (sem mudança de conteúdo)
```

`app-tabs.tsx`/`app-tabs.web.tsx` não são alterados — `(tabs)/_layout.tsx` é um arquivo novo que só importa e renderiza o `AppTabs` já existente. Os nomes `name="index"`/`name="explore"` dos `NativeTabs.Trigger` continuam válidos (resolvem para os irmãos dentro do mesmo grupo).

O gate de splash já existente (`fontsLoaded` em `_layout.tsx`) passa a esperar também `useCurrentUser()` resolver (`isPending`), pra não desenhar `login`/`(tabs)` antes de saber se há sessão.

### 3. Formulário sem `Field`/`FieldError`

RNR não tem esse primitivo. Monta-se manualmente com `Label` + `Input` (já instalados) + um `<Text>` de erro (`text-sm text-destructive`) por campo — sem criar uma abstração `Field` nova, porque só esta tela usa isso agora (evita over-engineering; se um segundo formulário aparecer, aí sim extrai-se um componente).

### 4. Brand panel sem `<img>`

Os dois SVGs do front (`wave-haikei.svg`, `logo-text-horizontal-white.svg`) são copiados para `assets/images/` e renderizados via `expo-image` (`svg` já está em `assetExts` do Metro deste projeto — confirmado, não precisa de transformer novo).

### Rationale

**Por que `Stack.Protected` e não um simples `if (!user) return <LoginScreen />` dentro do `_layout.tsx` atual?**
Um `if` evita mover arquivos, mas aí `login` nunca seria uma rota real — só um componente chaveado manualmente, sem deep-link, sem back-button correto, sem se comportar como o resto do Expo Router. `Stack.Protected` é o padrão oficial (guia acima), suporta deep link direto pra `/login` e redireciona automaticamente quando o guard muda (ex: logout) — sem lógica de redirecionamento manual espalhada.

**Por que não usar Context/`useSession` como no exemplo da doc oficial?**
Porque duplicaria a fonte de verdade: o front já decidiu (e a doc do projeto — `use-current-user.ts` — comprova) que "quem está logado" vive **só** no cache do TanStack Query (`useCurrentUser`), nunca em um Context paralelo. O exemplo da doc do Expo é genérico; aqui usamos o mesmo padrão de guard, mas a fonte do `guard` é `useCurrentUser()`, não um `SessionProvider` novo.

---

## Impacto nas Áreas (OBRIGATÓRIO)

| Área | Arquivos afetados | O que muda |
|------|------------------|-----------|
| Rotas (telas) | `src/app/_layout.tsx` (reescrito), `src/app/login.tsx` (novo), `src/app/(tabs)/_layout.tsx` (novo — só importa/renderiza `AppTabs`, que não muda), `src/app/(tabs)/index.tsx` e `src/app/(tabs)/explore.tsx` (movidos, sem mudança de conteúdo) | Login passa a ser rota protegida por `Stack.Protected`; tabs passam a viver num grupo |
| Stores | `src/stores/use-auth-store.ts` (novo) | `kycStatus` — único estado global que não vem de fetch, igual ao front |
| Hooks | `src/hooks/use-login-mutation.ts`, `src/hooks/use-current-user.ts` (novos) | Mutation de login + query de usuário atual |
| Services | `src/services/auth.service.ts` (novo) | `login`, `logout`, `getMe` |
| Lib | `src/lib/api-client.ts`, `src/lib/api-errors.ts`, `src/lib/cookies.ts` + `.web.ts`, `src/lib/query-client.ts` (novos) | Cliente axios, mapeamento de erro pt-BR, leitura de CSRF (native/web), instância do `QueryClient` (+ `onlineManager`/`focusManager`) |
| Types | `src/types/auth.ts`, `src/types/auth.schema.ts` (novos) | Mesmos tipos do front |
| Components | `src/components/auth/login-form.tsx`, `src/components/auth/auth-brand-panel.tsx` (novos) | Formulário e painel de marca |
| Assets | `assets/images/wave-haikei.svg`, `assets/images/logo-text-horizontal-white.svg` (copiados do front) | Brand panel |
| Config | `package.json` (8 deps novas), `.env.example` (novo) | Ver Plano, passo 0 |

**Não incluído nesta tela** (fora de escopo, sinalizado — não é omissão silenciosa):
- `ThemeToggle` manual do front — mobile já segue o tema do sistema.
- Página `/kyc` e `requiredKyc` do `ProtectedRoute` do front — não existe tela de KYC no mobile ainda.

**Decisão explícita sobre `use-auth-store.ts` sem consumidor ainda:** criar a store agora, mesmo sem nenhuma tela lendo `kycStatus` nesta tarefa, é uma exceção deliberada à regra de não antecipar estado Zustand (ver `CLAUDE.md`/`component-reviewer`) — decisão do usuário: manter por paridade 1:1 com o front. Justificativa registrada: o front já modelou esse slice exatamente assim porque o backend já retorna KYC como parte do domínio de identidade (`../mybitcoin-api/docs/bussiness/02-identidade-e-acesso.md`), e a tela de KYC é o próximo ADR natural depois deste — criar a store agora evita reabrir a decisão de "onde mora o kycStatus" nesse próximo ADR. Não é estado morto: é preparação intencional e documentada, não uma antecipação silenciosa.

---

## Contratos de Dados

Idênticos ao front (mesma API):

### Request — `POST /auth/login`
```typescript
interface LoginRequest {
  email: string
  password: string
}
```

### Response — `POST /auth/login`
```typescript
interface LoginResponse {
  userId: string
  name: string
  email: string
  status: 'PENDING_EMAIL_VERIFICATION' | 'ACTIVE' | 'SUSPENDED'
}
```

### Response — `GET /auth/me`
```typescript
interface MeResponse {
  id: string
  name: string
  email: string
  status: 'PENDING_EMAIL_VERIFICATION' | 'ACTIVE' | 'SUSPENDED'
}
```

Erro (formato já usado pela API, ver `handleApiError` do front): `{ statusCode: number, code: string, message: string, details?: Record<string, string[]> }`.

---

## Estratégia de Estado

| Dado | Onde vive | Motivo |
|------|-----------|--------|
| Usuário autenticado | TanStack Query (`['auth','me']`, via `useCurrentUser`) | Fonte única de verdade — igual ao front (DATA-001 do front) |
| `kycStatus` | Zustand (`useAuthStore`) | Não vem de fetch ainda; cross-screen |
| Cookie de sessão (`__Host-session`) | Cookie jar nativo (gerenciado pelo próprio stack de rede do RN) | Nunca em `AsyncStorage`/Zustand |
| CSRF token | Lido on-demand do cookie jar (`src/lib/cookies.ts`), nunca guardado em estado | Mesma vida útil do cookie |
| Estado do formulário (email/senha/erros) | `react-hook-form` local | Só a tela de login usa |

---

## Plano de Implementação (na ordem)

### 0. Dependências (OBRIGATÓRIO antes do passo 1)

Nenhuma das libs abaixo existe em `package.json` hoje — instalar antes de escrever qualquer arquivo:

```bash
# JS puro
npm install axios zod react-hook-form @hookform/resolvers @tanstack/react-query zustand

# Nativas — usar expo install para garantir versão compatível com o SDK 57
npx expo install @preeternal/react-native-cookie-manager expo-network
```

`@preeternal/react-native-cookie-manager` exige rebuild do dev client (`npx expo run:android` / `run:ios`) depois de instalar — não bastam só `npm install` + Metro reload. `expo-network` é módulo oficial do Expo SDK, já embutido no Expo Go, e não exige rebuild por si só (só é irrelevante aqui porque o cookie manager já força a saída do Expo Go de qualquer forma).

- [ ] `.env.example` — criar com `EXPO_PUBLIC_API_URL=http://localhost:3000` (ver Decisão, item 1, "Base URL da API")

### 1. Tipos (`src/types/`)
- [ ] `auth.ts` — `AuthUser`, `LoginResponse`, `MeResponse`, `UserStatus` (idêntico ao front)
- [ ] `auth.schema.ts` — `loginSchema` (zod) + `LoginFormData`

### 2. Lib (`src/lib/`)
- [ ] `api-errors.ts` — `ApiError`, `parseApiError`, `handleApiError` (idêntico ao front)
- [ ] `cookies.ts` (native, `@preeternal/react-native-cookie-manager`) + `cookies.web.ts` (web, `document.cookie`) — `readCsrfToken(baseUrl): Promise<string | null>`
- [ ] `api-client.ts` — instância axios, `baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'`, interceptor de request (CSRF em mutations) e de response (mapeia erro via `parseApiError`)
- [ ] `query-client.ts` — instância única do `QueryClient` **+** configura `onlineManager` (via `expo-network`) e `focusManager` (via `AppState`, ignorado na web) — ver Decisão, item 1, "Refetch em foco/reconexão"

### 3. Service (`src/services/`)
- [ ] `auth.service.ts` — `login`, `logout`, `getMe`

### 4. Store (`src/stores/`)
- [ ] `use-auth-store.ts` — `kycStatus`

### 5. Hooks (`src/hooks/`)
- [ ] `use-current-user.ts` — `useQuery(['auth','me'])`
- [ ] `use-login-mutation.ts` — `useMutation` + popula cache de `use-current-user` no `onSuccess`

### 6. Componentes (`src/components/auth/`)
- [ ] `auth-brand-panel.tsx` — SVGs via `expo-image`
- [ ] `login-form.tsx` — `react-hook-form` + `zodResolver` + `Label`/`Input`/`Button` do RNR

### 7. Rotas (`src/app/`)
- [ ] `(tabs)/index.tsx`, `(tabs)/explore.tsx` — mover (sem mudar conteúdo)
- [ ] `(tabs)/_layout.tsx` — arquivo novo que só importa e renderiza o `AppTabs` já existente (sem alterar `app-tabs.tsx`/`app-tabs.web.tsx`)
- [ ] `login.tsx` — tela de login (usa `login-form` + `auth-brand-panel`)
- [ ] `_layout.tsx` — `QueryClientProvider` + `Stack`/`Stack.Protected` guiado por `useCurrentUser()`

---

## Estados da UI

| Estado | Comportamento |
|--------|--------------|
| Loading (auth inicial) | Splash existente (`AnimatedSplashOverlay`) permanece visível até `fontsLoaded && !isPending` |
| Loading (submit do form) | Botão desabilitado, texto "Entrando..." (igual ao front) |
| Erro de validação (campo) | Texto `text-destructive` abaixo do input |
| Erro da API (`root`) | Mesmo texto de erro, mapeado por `handleApiError` (mensagens pt-BR já definidas — LOG-003 nunca revela qual campo) |
| Offline/erro de rede | `handleApiError` já cobre (`ApiError(0, 'NETWORK_ERROR', ...)` → "Erro de conexão. Verifique sua internet.") |
| Sucesso | Cache de `useCurrentUser` populado no `onSuccess`; `Stack.Protected` redireciona pra `(tabs)` automaticamente |

---

## Plataformas e Acessibilidade

- **Divergência por plataforma:** só em `src/lib/cookies.ts` (`.ts` native / `.web.ts` com `document.cookie`) — todo o resto (form, brand panel, rotas) é o mesmo arquivo para as 3 plataformas.
- **Touch targets:** `Button` do RNR já usa `h-10`/`h-11` (≥ 44px) por padrão.
- **Acessibilidade nativa:** `Label` (via `@rn-primitives/label`, já instalado) recebe `nativeID` e o `Input` correspondente recebe `aria-labelledby` apontando pro mesmo valor — é o padrão que a própria API do `LabelPrimitive.Text` já espera (`nativeID`: "Equivalent to `id` so that the same value can be passed as `aria-labelledby` to the input element"), e preserva o toque-pra-focar do `Label` (que é um `Pressable`). Ex.: `<Label nativeID="email-label">E-mail</Label>` + `<Input aria-labelledby="email-label" />`.
- **Safe area:** tela de login usa `SafeAreaView`, já que fica fora das tabs (sem inset calculado por elas).
- **Permissões nativas:** nenhuma.
- **Expo Go:** deixa de funcionar para o app inteiro a partir desta mudança (módulo nativo do cookie manager) — precisa de dev client.

---

## Edge Cases & Erros

| Caso | Comportamento decidido |
|------|----------------------|
| Credenciais inválidas | Mensagem genérica "E-mail ou senha inválidos." (LOG-003 — nunca diz qual campo) |
| Conta suspensa | "Sua conta foi suspensa. Entre em contato com o suporte." |
| Excesso de tentativas (LOG-006) | "Muitas tentativas de login. Tente novamente em alguns minutos." |
| Sem rede / API fora do ar | "Erro de conexão. Verifique sua internet." |
| Usuário já autenticado abre `/login` | `Stack.Protected` redireciona pra `(tabs)` automaticamente |
| App reaberto com sessão válida (cookie ainda vivo) | `useCurrentUser` resolve com usuário → entra direto em `(tabs)`, sem passar por `login` |
| Cookie `Secure` rejeitado contra `http://localhost` em dev | Risco conhecido (ver Decisão, item 1) — não tratado como bug de código |

---

## Consequências

**Positivas:**
- Estabelece o padrão de networking (axios + TanStack Query + api-errors) que toda integração futura no mobile vai reusar.
- Sessão idêntica à do front — zero mudança no backend.

**Negativas / Trade-offs:**
- App sai do Expo Go a partir de agora (módulo nativo de cookie) — todo teste local passa a exigir dev client.
- Cookies `Secure` podem não persistir contra backend `http://` em dev no dispositivo/emulador (mitigação: usar backend com HTTPS em dev, ou investigar quando/se isso ocorrer de fato).

---

## Decisões do Usuário (rastreabilidade)

- 2026-08-12 — "Como tratar sessão/autenticação no mobile?" → Cookie jar nativo, fiel ao front (não token).
- 2026-08-12 — Confirmado: não portar `ThemeToggle` manual (mobile já segue tema do sistema).
- 2026-08-12 — Confirmado: montar formulário manualmente (sem `Field`), já que RNR não tem esse primitivo e só há um formulário até agora.
- 2026-08-12 — "Criar `use-auth-store.ts` (`kycStatus`) mesmo sem consumidor nesta tarefa?" → Manter, por paridade 1:1 com o front (decisão tomada durante a amendação pós-`/adr-validator`, gap #5).

---

## Referências

- `../mybitcoin-front/src/pages/login-page.tsx`, `src/components/auth/*`, `src/types/auth*.ts`, `src/services/auth.service.ts`, `src/lib/api-client.ts`, `src/lib/api-errors.ts`, `src/hooks/use-login-mutation.ts`, `src/hooks/use-current-user.ts`, `src/stores/use-auth-store.ts`, `src/components/protected-route.tsx`, `src/App.tsx`
- `../mybitcoin-api/src/modules/identity/presentation/sessions.controller.ts`, `session-cookies.ts`
- `../mybitcoin-api/docs/bussiness/02-identidade-e-acesso.md` (LOG-001 a LOG-006)
- https://docs.expo.dev/router/advanced/authentication/ (lido nesta sessão — padrão `Stack.Protected`, SDK 57)

---

## Validação (Estágio 2) — 2026-08-12

**Veredito:** 🔁 **REVISAR** — 2 gaps ALTO.

Re-derivação independente: confirmei em `package.json` (raiz do repo) que nenhuma das dependências que o plano assume (`axios`, `zod`, `react-hook-form`, `@hookform/resolvers`, `@tanstack/react-query`, `zustand`, `@preeternal/react-native-cookie-manager`) está instalada hoje — só `expo-image` já existe. Confirmei em `node_modules/expo-router/build/layouts/stack-utils/mapProtectedScreen.js` que `Stack.Protected` existe de fato na versão instalada (`expo-router@57.0.11`) — não é só doc, funciona aqui. Confirmei em `node_modules/@rn-primitives/label/dist/index.d.ts` a API real do `LabelPrimitive.Text` (aceita `nativeID`, documentado como "Equivalent to `id` so that the same value can be passed as `aria-labelledby`"). Não há `.env`/`.env.example` no repo nem chave em `app.json` para base URL de API.

| # | Severidade | Gap | Evidência | Correção exigida |
|---|-----------|-----|-----------|-----------------|
| 1 | ALTO | Plano de Implementação não tem um passo "instalar dependências" — `axios`, `zod`, `react-hook-form`, `@hookform/resolvers`, `@tanstack/react-query`, `zustand`, `@preeternal/react-native-cookie-manager` não existem em `package.json` hoje e o ADR nunca menciona adicioná-las. | `package.json:6-32` (nenhuma delas listada) vs. ADR usa todas a partir da seção "Decisão" e do Plano (itens 1–6) | Adicionar um passo 0 explícito no Plano de Implementação: instalar as dependências acima (`npx expo install`/`npm install` conforme nativo vs JS puro) antes do passo 1 |
| 2 | ALTO | ADR não trata refetch em foco/reconexão do TanStack Query no React Native — por padrão, ao contrário do browser, RN não dispara refetch automático quando o app volta de background ou a rede reconecta, o que afeta diretamente se `useCurrentUser` mostra sessão correta ao reabrir o app. | Doc oficial TanStack Query, seção "React Native" (https://tanstack.com/query/latest/docs/framework/react/react-native): "React Query already supports auto refetch on reconnect in web browser. To add this behavior in React Native you have to use React Query `onlineManager`..." + seção "Refetch on App focus" (`AppState` + `focusManager`) | Adicionar ao Plano (na seção "Lib" ou um novo item): configurar `focusManager` via `AppState` e `onlineManager` via `expo-network` (evita dependência nativa extra — já é do ecossistema Expo) na inicialização do `QueryClientProvider` |

**Gaps MÉDIO/BAIXO** (não bloqueiam sozinhos, mas precisam de decisão explícita registrada — não silenciosa):

| # | Severidade | Gap | Evidência | Correção sugerida |
|---|-----------|-----|-----------|-----------------|
| 3 | MÉDIO | Base URL da API não tem fonte definida (o front usa `import.meta.env.VITE_API_URL ?? 'http://localhost:3000'`; não há `.env`/`app.json.extra` equivalente no mobile) | `ls .env*` vazio; `app.json` sem chave de API URL | Definir no ADR: `process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'` (convenção Expo para env pública) e citar se precisa de `.env`/`.env.example` novo |
| 4 | MÉDIO | ADR usa storage diferente do que `CLAUDE.md` define como regra do projeto ("Tokens/session → `expo-secure-store`, never `AsyncStorage` in plaintext") sem reconhecer a divergência — a decisão de cookie jar nativo é defensável (API só suporta cookie), mas o ADR não registra explicitamente que está abrindo uma exceção a essa regra documentada | `CLAUDE.md` (seção "Target folder structure", última linha) vs. ADR seção "Decisão", item 1 | Adicionar uma frase explícita na Decisão: "isto é uma exceção justificada à regra padrão do `CLAUDE.md` — sessão não vai para `expo-secure-store` porque não é um token que a aplicação gerencia, é um cookie HTTP gerenciado pelo próprio stack de rede" |
| 5 | MÉDIO | `use-auth-store.ts` (`kycStatus`) não tem nenhum consumidor no escopo atual desta tarefa (a tela de KYC está explicitamente fora de escopo) — pelo critério do próprio projeto ("não crie estado Zustand para estado que só uma tela usa"/não antecipe), criar a store agora com zero leitores é adiantar estado antes da dor real | ADR, linha 93 ("não existe tela de KYC no mobile ainda") + `component-reviewer` (critério 6: estado global para coisa que nada usa ainda) | Decidir explicitamente: (a) manter por paridade 1:1 com o front e justificar por escrito, ou (b) adiar a criação de `use-auth-store.ts` para quando a tela de KYC existir — qualquer uma das duas é aceitável, mas precisa estar escrita, não implícita |
| 6 | MÉDIO | Mecanismo de acessibilidade descrito no ADR ("a label vira `accessibilityLabel` explícito no input") não é o padrão da API já instalada — `LabelPrimitive.Text` (`@rn-primitives/label`) foi desenhado para `nativeID` + `aria-labelledby` (ver evidência acima), que também preserva o toque-pra-focar do `Label` (Pressable) | `node_modules/@rn-primitives/label/dist/index.d.ts` (comentário do campo `nativeID`) vs. ADR, seção "Plataformas e Acessibilidade" | Trocar a frase por: `<Label nativeID="email-label">` + `<Input aria-labelledby="email-label">`, igual ao padrão do primitivo instalado |
| 7 | BAIXO | Frase da Decisão ("`app-tabs.tsx` continuam existindo como estão — só passam a ser montados por `(tabs)/_layout.tsx`") e do Plano item 7 ("`(tabs)/_layout.tsx` ← lógica atual de `app-tabs.tsx`") descrevem a mesma coisa de forma um pouco inconsistente (uma diz "não move", a outra parece implicar mover lógica) | ADR, seção "Decisão" item 2 vs. "Plano de Implementação" item 7 | Uniformizar a frase do Plano: "`(tabs)/_layout.tsx` — novo arquivo que apenas importa e renderiza o `AppTabs` já existente" |

**Cobertura dos checklists:** A (Zustand) → gap #5. B (TanStack Query) → gap #2. C (Contratos) → OK, consistente com a API real (`sessions.controller.ts`/`session-cookies.ts`). D (Componentes/NativeWind/navegação) → OK (`Stack.Protected` confirmado real na versão instalada; nenhum componente duplicado — `Card`/`Input`/`Label`/`Button`/`Text` já existem e têm os sub-componentes que o login precisa). E (Acessibilidade) → gap #6. F (Performance) → N/A (sem listas nesta tela). G (Segurança) → gap #4; inputs validados via zod, OK. H (Plano de implementação) → ordem correta, mas incompleta (gap #1).

**Próximo passo:** Rode `/adr-architect` para amendar o ADR endereçando os gaps #1 e #2 (bloqueantes) — e de preferência também #3–#6 —, depois re-valide com `/adr-validator`.

---

## Validação (Estágio 2) — 2026-08-12 (revalidação)

**Veredito:** ✅ **APROVA** — os 2 gaps ALTO e os 4 MÉDIO da rodada anterior foram fechados com conteúdo tecnicamente correto (verifiquei cada um de novo, não confiei que "foi editado" = "foi corrigido certo"):

- **Gap #1 (deps):** Passo 0 do Plano (linhas 158–172) lista os 8 pacotes certos com os nomes certos — confirmei de novo via `npm view` que `expo-network@57.0.1`, `@preeternal/react-native-cookie-manager`, `axios`, `zod`, `react-hook-form`, `@hookform/resolvers`, `@tanstack/react-query`, `zustand` existem tal como escritos. OK.
- **Gap #2 (focus/reconnect):** parágrafo na Decisão (linhas 46–48) + passo em `query-client.ts` (linha 182) — tecnicamente alinhado com a doc oficial do TanStack Query (mesma citada na validação anterior). OK.
- **Gap #3 (base URL):** `EXPO_PUBLIC_API_URL` + `.env.example` — convenção real do Expo (prefixo `EXPO_PUBLIC_` é inlined em build time, equivalente ao `VITE_` do front). OK.
- **Gap #4 (exceção `expo-secure-store`):** parágrafo reconhece a regra do `CLAUDE.md` e justifica a exceção sem contradizer a regra pra casos futuros (token de app ainda vai pra secure-store). OK.
- **Gap #5 (`kycStatus` sem consumidor):** justificativa por escrito + rastreada em "Decisões do Usuário". OK.
- **Gap #6 (a11y do Label):** `nativeID`/`aria-labelledby` — bati de novo com `@rn-primitives/label/dist/index.d.ts`, confere. OK.
- **Gap #7 (frase do `app-tabs`):** uniformizada nas 4 ocorrências (Decisão item 2, diagrama de árvore, Plano item 7, tabela de Impacto). OK.

**Novos gaps BAIXO encontrados nesta revalidação** (não bloqueiam — registrados, não silenciosos):

| # | Severidade | Gap | Evidência | Correção sugerida |
|---|-----------|-----|-----------|-----------------|
| 8 | BAIXO | Intro da Decisão diz "três adaptações de plataforma" mas lista 4 itens (1–4) | linha 32 vs. `### 1.`–`### 4.` (linhas 34, 50, 68, 72) | Trocar para "com as seguintes decisões:" (nem todas são "adaptação de plataforma" — item 2 é arquitetura de navegação, não específico de plataforma) |
| 9 | BAIXO | Tabela de Impacto diz "(7 deps novas)" mas o Passo 0 lista 8 (`axios`, `zod`, `react-hook-form`, `@hookform/resolvers`, `@tanstack/react-query`, `zustand`, `@preeternal/react-native-cookie-manager`, `expo-network`) | linha 98 vs. linhas 164/167 | Corrigir para "(8 deps novas)" |
| 10 | BAIXO | "`expo-network` ... exige rebuild do dev client" (linha 170) é impreciso — `expo-network` é módulo oficial do SDK, já vem embutido no Expo Go; quem força o dev client é só o `@preeternal/react-native-cookie-manager` | `npm view expo-network` (pacote oficial versionado com o SDK, sem indicação de custom native code fora do padrão Expo Go) | Ajustar a frase pra deixar claro que só o cookie-manager exige rebuild |

**Cobertura dos checklists:** todos os itens A–H revisitados; nenhum novo gap MÉDIO/ALTO. Os 3 itens acima são só precisão de texto, não mudam nenhuma decisão de arquitetura.

**Próximo passo:** ADR pronto para implementação. Rode `/adr-executor` (as 3 correções BAIXO acima podem ser feitas direto pelo executor de passagem, sem precisar de nova rodada de architect/validator).
