# GEMINI.md

## Project Overview

**TTORANG (또랑)** is a React-based frontend application for presentation and slide management. It allows users to view slides, manage scripts, handle feedback (opinions), and track script history.

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 7
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Routing:** React Router v7
- **Package Manager:** npm

## Key Directories

- `src/components/`: React components (Common, Layout, Slide-specific).
- `src/stores/`: Zustand stores for global state (e.g., `slideStore.ts`, `authStore.ts`).
- `src/hooks/`: Custom React hooks (e.g., `useSlideSelectors.ts`).
- `src/pages/`: Page-level components.
- `src/styles/`: Global styles and design tokens.
- `src/types/`: TypeScript type definitions.
- `src/constants/`: Constant values and mock data.

## Development Workflow

### Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build for production (includes type checking).
- `npm run lint`: Run ESLint.
- `npm run prettier`: Check code formatting.
- `npm run prettier:fix`: Fix code formatting.
- `npm run type-check`: Run TypeScript type checker.

### Conventions

#### Naming

- **Folders:** `kebab-case` (e.g., `navigation-bar`)
- **Files (.ts):** `camelCase` (e.g., `apiClient.ts`)
- **Components (.tsx):** `PascalCase` (e.g., `Button.tsx`, `SlideViewer.tsx`)
- **Page Components:** `PascalCase + Page` (e.g., `HomePage.tsx`)
- **Variables/Functions:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`

#### Coding Standards

- **Exports:**
  - Components: `export default` at the bottom of the file.
  - Utils/Hooks: `named export`.
- **Styling:** Use Tailwind CSS utility classes. Avoid inline styles.
- **State:** Use Zustand for global state; prefer selectors to optimize re-renders.
- **Path Alias:** Use `@/` to refer to the `src/` directory.

#### Git

- **Commits:** Follow Conventional Commits.
  - Format: `type: message (#issue)`
  - Example: `feat: implement login page (#123)`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `design`, `ci`, `perf`
- **Branches:**
  - Format: `type/description#issue`
  - Example: `feat/login#12`

## Architecture Highlights

- **State Management (Zustand):**
  - Stores are located in `src/stores/`.
  - `slideStore.ts` manages slide data, scripts, history, and opinions.
  - Usage pattern involves selectors (e.g., `useSlideSelectors`) to prevent unnecessary re-renders.
- **Routing:**
  - Defined using React Router v7.
  - Routes: `/` (Home), `/:projectId/slide/:slideId`, `/:projectId/video`, `/:projectId/insight`.
