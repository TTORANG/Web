# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TTORANG (또랑) - A React-based presentation/slide management frontend application.

## Development Commands

```bash
npm run dev              # Start dev server (connects to dev API)
npm run dev:local        # Start dev server (connects to local API)
npm run build            # Production build with TypeScript check
npm run type-check       # TypeScript type checking only
npm run lint             # ESLint checking
npm run prettier         # Check formatting
npm run prettier:fix     # Auto-fix formatting
```

## Tech Stack

- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Tailwind CSS v4** for styling
- **Zustand** for state management (with persist middleware)
- **React Router v7** for routing
- Node 22 (see `.nvmrc`)

## Architecture

### Directory Structure

```
src/
├── components/          # React components
│   ├── common/          # Reusable UI (Logo, LoginButton, Popover)
│   ├── layout/          # Layout components (Layout, Gnb)
│   └── script-box/      # Script viewer components
├── constants/           # App constants, navigation utils
├── hooks/               # Custom React hooks
├── pages/               # Page components (HomePage, SlidePage, etc.)
├── stores/              # Zustand stores (authStore)
├── styles/              # Global CSS, theme tokens
└── types/               # TypeScript types/interfaces
```

### Routing Structure

```
/ (Home)
/:projectId
├── /slide/:slideId     # Main slide viewer
├── /video              # Video content
└── /insight            # Analytics view
```

### Design Tokens

Use design system variables defined in `src/styles/`:

- Colors: `--color-main`, `--color-gray-{100-900}`, `--color-error`, `--color-success`
- Typography classes: `.text-body-m`, `.text-body-s`, `.text-caption`
- Prefer Tailwind utilities and design tokens over inline styles

## Conventions

### Naming

| Target            | Convention          | Example         |
| ----------------- | ------------------- | --------------- |
| Folders           | `kebab-case`        | `user-profile/` |
| Components (.tsx) | `PascalCase`        | `UserCard.tsx`  |
| Utils (.ts)       | `camelCase`         | `apiClient.ts`  |
| Page components   | `PascalCase + Page` | `MainPage.tsx`  |
| Constants         | `UPPER_SNAKE_CASE`  | `MAX_COUNT`     |

### Exports

- **Components**: `export default` at bottom
- **Utilities/hooks**: `named export`
- **Types**: `export type` / `export interface`

### Commits

Format: `type: message (#issue)`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `design`, `ci`, `perf`

### Branches

Format: `type/description#issue` (e.g., `feat/login#12`)

## Code Quality

- TypeScript strict mode enabled - avoid `any`
- Use `<Link>` or `useNavigate` instead of `<a>` tags for SPA navigation
- Use semantic HTML elements over `<div>`
- Environment variables must use `VITE_` prefix
- Husky runs lint-staged on pre-commit (ESLint + Prettier)
- CI runs: lint → type-check → build

## Environment Variables

```bash
VITE_API_URL     # API server URL
VITE_APP_TITLE   # App title (default: "또랑")
```

Access via `import.meta.env.VITE_*`

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig and vite.config)
