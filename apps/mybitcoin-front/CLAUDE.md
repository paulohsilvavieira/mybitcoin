# mybitcoin-front — Guia para Claude Code

## O que é este projeto

Frontend SPA da plataforma de criptomoedas mybitcoin. Consome a API em `/home/paulohenrique/Developer/mybitcoin/mybitcoin-api/`.

**Funcionalidades:** autenticação/KYC, carteiras, ledger, order book, depósitos/saques Bitcoin.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 19 (SPA) |
| Build | Vite 8 |
| Linguagem | TypeScript 6 |
| Estilos | TailwindCSS v4 (utilitário puro, sem biblioteca de componentes) |
| Estado global | Zustand |
| Fetching | TanStack Query v5 + Axios |
| Roteamento | React Router v7 |
| Formulários | react-hook-form + zod |
| Ícones | Lucide React |
| Testes | Vitest + Testing Library |
| Package manager | pnpm |

---

## Arquitetura

SPA simples — **sem Clean Architecture**. A regra: manutenção boa, sem over-engineering.

### Estrutura de pastas

```
src/
├── components/
│   ├── ui/              ← primitivos de UI em Tailwind puro (button, card, input, etc.) — podem ser editados diretamente
│   └── <domínio>/       ← componentes de negócio (ex: wallet/, order-book/)
├── pages/               ← uma pasta por rota/tela
├── hooks/               ← custom hooks reutilizáveis
├── stores/              ← zustand stores (um arquivo por domínio)
├── services/            ← chamadas à API (axios + TanStack Query)
├── lib/
│   ├── utils.ts         ← cn(), formatSatoshi(), formatCurrency()
│   └── api-errors.ts    ← ApiError, handleApiError(), parseApiError()
├── types/               ← tipos TypeScript compartilhados
├── invariants.ts        ← invariantes frontend (FIN-xxx, UI-xxx, DATA-xxx, SEC-xxx)
└── test-utils.tsx       ← helpers para testes (renderWithProviders)
```

### Zustand vs TanStack Query vs useState

Regra prática: **dado que vem da API é problema do TanStack Query, não do Zustand.** Reimplementar cache/revalidação/staleness na mão dentro de uma store é o erro mais comum aqui — foi exatamente o que aconteceu com sessão/usuário antes de ser corrigido (ver `hooks/use-current-user.ts`, `hooks/use-login-mutation.ts`).

Use Zustand só quando as três condições valem ao mesmo tempo:

1. O estado é **client-side genuíno** — nunca veio de um fetch (tema, sidebar aberta/fechada, filtros de UI, moeda de exibição preferida)
2. Precisa ser **lido por componentes distantes na árvore** — se só o componente pai e um filho usam, `useState` no pai resolve
3. **Sobrevive a navegação entre páginas** — senão é estado local mesmo

Na dúvida, comece em `useState`/query e só suba pro Zustand quando sentir a dor real de prop drilling — não antecipe.

| Tipo de estado | Onde vive | Exemplo |
|---|---|---|
| Dado de API (servidor) | TanStack Query (`useQuery`/`useMutation`) | usuário autenticado, saldo, carteiras, histórico de transações |
| Client-side, cross-page | Zustand | tema, moeda de exibição, sidebar |
| Client-side, local | `useState` | estado de formulário, modal/drawer em componente único |

**NÃO use Zustand para** estado local de formulário, estado de modal/drawer em componente único, nem para nenhum dado que a API retorna — use `useState` ou TanStack Query, respectivamente.

---

## Invariantes Frontend

Definidas em `src/invariants.ts`. VIOLAÇÃO = BUG.

### Financeiras
- **FIN-001:** Valores monetários NUNCA são convertidos para `number` em componente, hook ou utilitário
- **FIN-002:** `formatSatoshi()` é o ÚNICO caminho para exibir valores satoshi
- **FIN-003:** Nenhuma chamada API financeira sem verificar auth + KYC status

### UI
- **UI-001:** Toda página trata `loading`, `error` e `empty` states
- **UI-002:** Touch targets em elementos interativos são mínimo 44px
- **UI-003:** Todo input tem `<Label>` associado com `htmlFor`
- **UI-004:** Nenhum componente excede 150 linhas (extrair ou dividir)

### Dados
- **DATA-001:** Dados da API vivem APENAS no cache do TanStack Query
- **DATA-002:** Zustand armazena APENAS estado global cross-page
- **DATA-003:** Estado local usa `useState` — NUNCA Zustand
- **DATA-004:** Nenhum dado sensível (senha, token, chave privada) é armazenado em state persistente

### Segurança
- **SEC-001:** Nenhum conteúdo dinâmico é renderizado sem sanitização (XSS)
- **SEC-002:** Tokens de auth vivem em httpOnly cookies ou memory — NUNCA em localStorage
- **SEC-003:** Valores monetários nunca interpolados em URLs ou logs do client

---

## Convenções críticas

### Valores monetários — sempre `string` no frontend

A API retorna valores em satoshi como `string` (bigint serializado). No frontend:
- **Nunca converta para `number`** — `Number("9007199254740993")` perde precisão
- Use `BigInt()` para cálculos se necessário
- Para exibição, use `formatSatoshi()` de `src/lib/utils.ts`

```typescript
// Correto
const formatted = formatSatoshi(balance) // "0.001 BTC" ou "100,000 sat"

// Errado
const amount = Number(balance) // perde precisão acima de 2^53
```

### Componentes React

- Mobile-first obrigatório — design para < 768px, enriqueça com `md:` e `lg:`
- Acessibilidade não é opcional: botões com `aria-label`, inputs com `<Label>`, foco visível
- Semântica HTML: `<button>` para ações, `<a>` para navegação, `<h1>`–`<h6>` em ordem
- Antes de criar um novo primitivo, verifique se já existe algo reutilizável em `src/components/ui/`

### Anti-god component (UI-004)

| Regra | Limite | Ação |
|-------|--------|------|
| Linhas por componente | ≤ 150 | Extrair sub-componentes ou hooks |
| Props por componente | ≤ 5 (senão, usar objeto) | Agrupar em interface |
| Components por arquivo | 1 componente export + sub-componentes internos | Separar em arquivos distintos |
| Depth de nesting JSX | ≤ 4 níveis | Extrair sub-componente |

**Estrutura de pasta por feature:**
```
src/components/wallet/
├── balance-card.tsx          ← componente isolado
├── transaction-table.tsx     ← componente isolado
├── deposit-form.tsx          ← componente isolado
├── withdraw-form.tsx         ← componente isolado
└── index.ts                  ← barrel export (opcional)
```

**NUNCA criar:**
- `index.tsx` com tudo inline
- Componente que faz fetch + render + form + validação
- Componente com mais de 3 responsabilidades

### Primitivos de UI (Tailwind puro)

- Tokens semânticos: `text-foreground`, `bg-muted`, `border-border` — nunca `text-gray-500`
- `gap-*` em flex/grid, nunca `space-y-*` ou `margin` em filhos
- `size-*` quando width = height (`size-10` não `w-10 h-10`)
- `cn()` de `@/lib/utils` para compor classes
- Os primitivos (`button`, `card`, `input`, etc.) vivem em `src/components/ui/` como componentes próprios em Tailwind puro — sem Radix, sem CVA, sem CLI de geração. Podem e devem ser editados diretamente quando necessário.
- Para variantes de componente (ex: `variant="primary" | "danger"`), use uma função TS simples ou um objeto de mapeamento de classes — não introduza CVA:

```typescript
const buttonVariants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
} as const

function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants[variant], className)} {...props} />
}
```

### Formulários (react-hook-form + zod)

```typescript
// Schema zod define validação + tipos (single source of truth)
import { z } from 'zod/v4'

const depositSchema = z.object({
  amount_satoshi: z.string().refine((val) => {
    const big = BigInt(val)
    return big > 0n && big <= 2_100_000_000_000_000n
  }, 'Valor inválido'),
  address: z.string().regex(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/, 'Endereço Bitcoin inválido'),
})

// Componente usa react-hook-form + componentes de formulário próprios (Tailwind puro)
function DepositForm() {
  const form = useForm<DepositFormData>({ resolver: zodResolver(depositSchema) })
  const { register, formState: { errors } } = form

  // Usar <Field>, <Label>, <Input> customizados do projeto,
  // com a mensagem de erro renderizada manualmente a partir de formState.errors
  return (
    <Field>
      <Label htmlFor="amount_satoshi">Valor</Label>
      <Input id="amount_satoshi" {...register('amount_satoshi')} />
      {errors.amount_satoshi && (
        <p className="text-sm text-destructive">{errors.amount_satoshi.message}</p>
      )}
    </Field>
  )
}
```

**Regras:**
- Schema zod = validação + tipos (single source of truth)
- Componentes usam `<Field>`, `<Label>`, `<Input>` (e demais primitivos próprios em `src/components/ui/`) — mensagens de erro são renderizadas manualmente a partir de `form.formState.errors`, sem componentes de formulário de biblioteca externa
- Erros da API são setados via `form.setError('root', { message: '...' })`
- Nunca validação manual com `if/else` no componente

### Error Handling

- **Error Boundary** em `src/components/error-boundary.tsx` — encapsula páginas
- **ApiError** em `src/lib/api-errors.ts` — mapeamento centralizado de erros da API
- **handleApiError()** — converte qualquer erro para mensagem em pt-BR
- Toast de erros via componente Toast próprio em Tailwind puro

### Code Splitting / Lazy Loading

```typescript
// Roteamento com lazy loading por página
const WalletPage = lazy(() => import('./pages/wallet/WalletPage'))
const OrderBookPage = lazy(() => import('./pages/order-book/OrderBookPage'))

// App.tsx ou router config:
<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
  </Routes>
</Suspense>
```

### Proteção de Rotas

- `ProtectedRoute` em `src/components/protected-route.tsx`
- Verifica auth (Zustand store) + KYC (se necessário)
- Redireciona para `/login` ou `/kyc` conforme o caso
- `useAuthStore` em `src/stores/use-auth-store.ts`

---

## Comandos principais

```bash
pnpm dev                    # servidor de desenvolvimento
pnpm build                  # build de produção
pnpm lint                   # linting
pnpm test                   # testes (vitest run)
pnpm test:watch             # testes em watch mode
pnpm test:coverage          # testes com cobertura
```

---

## API

A API base fica em `VITE_API_URL` (`.env`). Todos os valores monetários chegam como `string` (satoshi serializado como bigint). Veja a documentação completa em `../mybitcoin-api/docs/`.

## O que NÃO fazer

- **Não use `number` para valores financeiros** — use `string` (input) ou `BigInt` (cálculo)
- **PODE editar arquivos em `src/components/ui/`** — são componentes próprios do projeto em Tailwind puro, não gerados por CLI
- **Não instale ou reintroduza shadcn/ui, Radix ou CVA** — os primitivos de UI são Tailwind puro, mantidos manualmente em `src/components/ui/`
- **Não use cores hardcoded do Tailwind** (`text-gray-500`) — use tokens semânticos (`text-muted-foreground`)
- **Não coloque lógica de negócio em componentes** — mova para hooks ou stores
- **Não crie estado Zustand para estado local** — `useState` para coisas que só uma tela precisa
- **Não crie componentes god** — máximo 150 linhas, máximo 5 props, máximo 1 componente por arquivo
- **Não esqueça Error Boundary** — toda rota deve ter tratamento de erro
- **Não armazene tokens em localStorage** — use httpOnly cookies ou memory
- **Não use `space-y-*`** — use `gap-*` em flex/grid
