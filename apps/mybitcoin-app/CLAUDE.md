# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project context

This is the **mobile app** for the MyBitcoin platform, a sibling of two other repos in `../`:

- `../mybitcoin-api` — NestJS backend (auth, KYC, wallets, double-entry ledger, order book/matching engine, on-chain BTC deposits/withdrawals). No ORM, raw `pg` driver, migrations under `src/infrastructure/database`.
- `../mybitcoin-front` — Web frontend (Vite + React + TypeScript).

This repo is currently a near-default **Expo Router (SDK 57)** template — there is no networking/API-client layer, auth, or state management wired up yet. When adding features that talk to the backend, check `../mybitcoin-api` for the actual endpoint contracts/DTOs rather than guessing.

**Expo has changed significantly.** Before writing any Expo-related code, read the versioned docs at https://docs.expo.dev/versions/v57.0.0/ — do not rely on older/remembered Expo APIs (e.g. this project already uses `expo-router/unstable-native-tabs`, `expo-glass-effect`, `@expo/ui`).

## Commands

```bash
npm install          # install deps
npx expo start       # start dev server (Expo Go / dev client)
npm run ios          # start + open iOS simulator
npm run android       # start + open Android emulator
npm run web           # start + open web
npm run lint          # expo lint (ESLint)
npm run reset-project # scaffolding helper: moves starter code to app-example/, blanks src/app
```

There is no test runner configured yet.

## Architecture

- **Routing**: Expo Router with file-based routes rooted at `src/app` (not the default `app/` — see the `main` entry `expo-router/entry` and `src/app/*`). `src/app/_layout.tsx` is the root layout: wraps the tree in `ThemeProvider` (light/dark from `react-native`'s `useColorScheme`), renders the animated splash overlay, and mounts `AppTabs`.
- **Navigation**: `src/components/app-tabs.tsx` defines the tab bar using `expo-router/unstable-native-tabs` (`NativeTabs`), which renders true native tab bars per-platform. It has a separate `app-tabs.web.tsx` for the web variant — check both when changing tab structure.
- **Platform-specific files**: this codebase relies on Expo/Metro's platform extension resolution (`*.web.tsx`, `*.web.ts`) instead of `Platform.OS` branching for larger pieces of UI/logic — see `use-color-scheme.ts` vs `use-color-scheme.web.ts`, and `animated-icon.tsx` vs `animated-icon.web.tsx`. Add a `.web.*` sibling when native and web behavior diverge structurally, rather than branching inside one file.
- **Theming**: `src/constants/theme.ts` defines `Colors` (light/dark), `Fonts` (per-platform via `Platform.select`), `Spacing`, and layout constants (`BottomTabInset`, `MaxContentWidth`). `src/hooks/use-theme.ts` resolves the active `Colors` entry from the current color scheme (`unspecified` falls back to `light`). Prefer these tokens over hardcoded colors/spacing.
- **Path aliases**: `@/*` → `src/*`, `@/assets/*` → `assets/*` (see `tsconfig.json`). Use these instead of relative imports across directories.
- **Styling**: NativeWind (Tailwind for React Native) is configured — `tailwind.config.js` (content globs `src/**/*.{js,jsx,ts,tsx}`, `nativewind/preset`), `babel.config.js` (`babel-preset-expo` with `jsxImportSource: 'nativewind'` + `nativewind/babel`), `metro.config.js` (`withNativeWind`, input `src/global.css`). `src/global.css` starts with the `@tailwind base/components/utilities` directives followed by the CSS custom properties (font stacks + design tokens); it's imported once, from `src/app/_layout.tsx` (the root layout), not from nested files. Existing components still use React Native `StyleSheet` + the `Colors`/`Spacing` tokens — NativeWind `className` props can be used going forward, but there's been no wholesale migration of existing screens.
- **Design tokens mirror `../mybitcoin-front`**: `../mybitcoin-front/src/index.css` is the source of truth for the platform's design system (shadcn/ui "Vega" style, Tailwind v4, colors in `oklch()`). Its own comment says these tokens must be mirrored into the mobile NativeWind config. `src/global.css` here has the same token names (`--background`, `--foreground`, `--primary`, `--card`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`, one `:root` block for light and one `.dark` block for dark) with values converted from `oklch()` to `"R G B"` (sRGB 0-255, space-separated — NativeWind/RN can't resolve `oklch()`). `tailwind.config.js` exposes them as `theme.extend.colors` using the shadcn `rgb(var(--x) / <alpha-value>)` pattern (e.g. `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`), so a class name reads identically to the front. **If a token changes in the front's `index.css`, recompute its RGB equivalent and update it here too** — there's no automated sync. Two intentional deviations from the front, both RN limitations: dark-mode `--border`/`--input` are baked-in opaque blends instead of translucent white (RN has no alpha-composited CSS vars here), and `--ring` dropped its 50% alpha (RN has no focus-ring/outline equivalent).
- **Typography**: the front uses `Geist Variable` (`@fontsource-variable/geist`). Native RN doesn't support variable fonts the same way, so `@expo-google-fonts/geist` is used instead with discrete static weights (`Geist_400Regular`, `Geist_500Medium`, `Geist_600SemiBold`, `Geist_700Bold`), loaded via `useFonts` in `src/app/_layout.tsx` (render is gated — returns `null` until loaded, keeping the splash screen up). `tailwind.config.js` maps them to `font-sans` (regular, the default/body weight) plus `font-sans-medium`, `font-sans-semibold`, `font-sans-bold` for heavier text — don't rely on Tailwind's plain `font-medium`/`font-bold` (font-*weight*) utilities for text using these fonts, since RN doesn't synthesize weights for custom typefaces.
- **TypeScript**: `strict` mode, extends `expo/tsconfig.base`. Typed routes are enabled (`experiments.typedRoutes` in `app.json`).
- **React Compiler**: enabled (`experiments.reactCompiler` in `app.json`) — avoid manual memoization patterns that fight the compiler.

## Target folder structure (grow into this, don't pre-create)

There's no networking/state layer yet (see Project context above). When one is needed, follow the same shape as `../mybitcoin-front` — adapted to Expo Router — rather than inventing a new convention:

```
src/
├── app/           ← routes (Expo Router, already exists)
├── components/
│   └── <domain>/  ← business components (e.g. wallet/, order-book/) + .web.tsx siblings where needed
├── constants/     ← design tokens (theme.ts, already exists)
├── hooks/         ← reusable hooks (already exists, kebab-case: use-color-scheme.ts)
├── stores/        ← zustand, one file per domain — create when the first global state is needed
├── services/      ← axios + TanStack Query — create when the first API call is needed
├── lib/
│   ├── utils.ts       ← cn(), formatSatoshi(), formatCurrency() — mirror ../mybitcoin-front/src/lib/utils.ts
│   └── api-errors.ts  ← ApiError, handleApiError()
└── types/         ← shared TypeScript types
```

Same state-placement rule as the front: API data → TanStack Query, cross-screen client state → Zustand, per-screen state → `useState`. Tokens/session → `expo-secure-store`, never `AsyncStorage` in plaintext.

## Skills available

Skills live in `.claude/skills/`. Invoke with `/name`. Ported and adapted from `../mybitcoin-front` (closest sibling in stack) — the two shadcn-specific skills weren't ported since this repo has no shadcn/RN component-registry equivalent; their token/spacing-audit principles were folded into `component-reviewer` instead.

### ADR pipeline

| Skill | Command | When to use |
|-------|---------|------------|
| `adr-architect` | `/adr-architect` | Start an ADR — asks questions, drafts the document |
| `adr-validator` | `/adr-validator` | Adversarial review before implementing |
| `adr-executor` | `/adr-executor` | Implement an accepted ADR |
| `adr-reviewer` | `/adr-reviewer` | Review the diff against the ADR |
| `adr-pr` | `/adr-pr` | Open a standardized PR |

**Order:** `architect` → `validator` → (human approval) → `executor` → `reviewer` → `pr`

### Planning and quality

| Skill | Command | What it does |
|-------|---------|----------|
| `task-planner` | `/task-planner` | Plans implementation before coding — lists files, hooks, stores and services to create |
| `component-reviewer` | `/component-reviewer` | Reviews components/screens: NativeWind tokens, native a11y, platform divergence (`.web.tsx`), hooks, Zustand |
| `dev-pipeline` | `/dev-pipeline` | Orchestrates the whole flow above end-to-end, with a human gate at every step |
