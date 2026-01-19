# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TTORANG (또랑) - A React-based presentation/slide management frontend application.

## Development Commands

```bash
npm run dev              # Start dev server
npm run dev:local        # Start dev server with MSW mocking
npm run build            # Production build with TypeScript check
npm run type-check       # TypeScript type checking only
npm run lint             # ESLint checking
npm run prettier         # Check formatting
npm run prettier:fix     # Auto-fix formatting
```

## Tech Stack

- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Tailwind CSS v4** for styling
- **Zustand** for state management (with persist + devtools middleware)
- **TanStack Query** for data fetching and caching
- **React Router v7** for routing
- **MSW** for API mocking in development
- Node 22 (see `.nvmrc`)

## Architecture

### State Management (Zustand)

The app uses **5 domain-specific stores**, each with distinct responsibilities:

- **`authStore`** - Authentication state (user, tokens, login modal)
  - Uses `persist` middleware for session retention
  - Pattern: Named actions for DevTools tracking (e.g., `'auth/login'`)

- **`slideStore`** - Slide data (script, opinions, history, reactions)
  - **Selector pattern**: Use custom hooks from `useSlideSelectors.ts` instead of direct store access
  - Example: `useSlideTitle()`, `useSlideScript()`, `useSlideActions()`
  - Implements optimistic UI for comments (immediate update, rollback on error)

- **`themeStore`** - Theme management with system preference detection
  - Sets `data-theme` attribute on document root
  - Cross-tab synchronization via `StorageEvent`

- **`homeStore`** - Home page UI state (search, view mode, sort)
- **`shareStore`** - Share modal workflow state

**Key Pattern**: Use selector hooks to prevent unnecessary re-renders. Instead of `useSlideStore((s) => s.field)`, use `useSlideTitle()`.

### Data Fetching (TanStack Query + Axios)

**Three-layer architecture:**

1. **Axios Client** (`src/api/client.ts`)
   - Centralized instance with automatic Bearer token injection
   - Hybrid error handling: Critical errors (401, 5xx) handled in interceptor, business errors (4xx) pass to React Query

2. **API Endpoints** (`src/api/endpoints/`)
   - Organized by domain: `slides.ts`, `opinions.ts`, `reactions.ts`
   - Plain async functions that use `apiClient`

3. **Query Hooks** (`src/hooks/queries/`)
   - TanStack Query wrappers: `useSlides()`, `useUpdateSlide()`, etc.
   - Cache invalidation pattern: Mutations invalidate related query keys
   - Hierarchical query keys for granular cache control

**Query Key Factory** (`queryClient.ts`):

```typescript
queryKeys = {
  slides: {
    all: ['slides'],
    list: (projectId) => ['slides', 'list', projectId],
    detail: (slideId) => ['slides', 'detail', slideId],
  },
};
```

### Component Organization

**Orchestrator Pattern**: `SlideWorkspace.tsx` is the central coordinator

- Initializes slide state in Zustand store
- Synchronizes layout between `SlideViewer` and `ScriptBox`
- Use this as entry point for understanding slide editing flow

**Structure by domain:**

```
components/
├── common/           # Reusable UI primitives + layout
├── slide/            # Slide viewer ecosystem (SlideWorkspace, SlideViewer, SlideList)
│   └── script/       # Script editing sub-module
├── feedback/         # Presentation feedback view
├── comment/          # Nested comment system
├── projects/         # Project cards
└── auth/             # Auth modals
```

**Barrel exports**: Use centralized exports from `components/common/index.ts`, `hooks/index.ts`, `pages/index.ts`

### Routing Structure

```
/                           → HomePage
/:projectId
├── /slide/:slideId        → SlidePage (main editor)
├── /video                 → VideoPage
└── /insight               → InsightPage
/feedback/slide/:projectId → FeedbackSlidePage (dark theme)
/dev                       → DevTestPage (component showcase)
```

**Key patterns:**

- URL params drive data fetching via `useParams()`
- Last slide memory: `constants/navigation.ts` stores last viewed slide per project
- Theme override: `/feedback` route uses `theme="dark"` prop

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

Format: `type/description-issue` (e.g., `feat/login-12`)

Note: Use `-` (hyphen) instead of `#` for issue numbers to maintain GitHub branch name compatibility.

## Development Patterns

### Auto-save for Script Editing

- Use `useAutoSaveScript()` hook which wraps mutations
- 500ms debounce delay prevents excessive API calls
- Compares with `lastSavedRef` to skip redundant saves

### Optimistic UI for Comments

- Zustand store updated immediately on comment add/delete
- If server request fails, entire list is rolled back via `setOpinions()`
- Prevents janky loading states

### Error Handling

- **Hybrid strategy**: Axios interceptor handles infrastructure errors (401, 5xx), React Query handles business errors (4xx)
- Single source: `handleApiError()` with status-code dispatch table
- Toast notifications via `sonner` library
- Set `error.isHandled = true` to prevent duplicate toasts

### MSW Mocking

- Enabled via `VITE_API_MOCKING` environment variable
- Use `npm run dev:local` for fully mocked development
- Unmocked requests pass through to real API

## Code Quality

- TypeScript strict mode enabled - avoid `any`
- Use `<Link>` or `useNavigate` instead of `<a>` tags for SPA navigation
- Use semantic HTML elements over `<div>`
- Prefer `rem` over `px` units
- Environment variables must use `VITE_` prefix
- Husky runs lint-staged on pre-commit (ESLint + Prettier)
- CI runs: lint → type-check → build

## Environment Variables

```bash
VITE_API_URL        # API server URL
VITE_APP_TITLE      # App title (default: "또랑")
VITE_KAKAO_JS_KEY   # Kakao JavaScript key for share feature
VITE_API_MOCKING    # Enable MSW mocking (set to "true")
```

Access via `import.meta.env.VITE_*`

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig and vite.config)

## Quick Start Guide

1. **Understanding data flow**: Start with `SlideWorkspace.tsx` to see how slide data flows from API → Zustand → Components
2. **Adding a new feature**: Create API endpoint → Query hook → Update Zustand store → Connect component
3. **State access**: Use selector hooks (`useSlideTitle()`) instead of direct store access to prevent re-renders
4. **Testing locally**: Use `npm run dev:local` to work with MSW mocks without backend dependency
