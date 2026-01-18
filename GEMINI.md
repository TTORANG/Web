# GEMINI.md

## Project Overview

**TTORANG (또랑)** is a React-based frontend application designed for presentation and slide management. It features a comprehensive suite of tools for viewing slides, managing scripts, providing feedback via comments and reactions, and recording presentation videos.

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 7
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Data Fetching:** TanStack Query v5
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Package Manager:** npm

## Key Directories

- **`src/api/`**: API client configuration and endpoint definitions (e.g., `opinions.ts`, `reactions.ts`, `slides.ts`).
- **`src/assets/`**: Static assets including icons, images, and social media logos.
- **`src/components/`**: React components organized by feature.
  - `auth/`: Authentication related components (LoginModal).
  - `comment/`: Comment system components (Input, List, Popover).
  - `common/`: Reusable UI components (Layout, Modal, Button, etc.).
  - `feedback/`: Components specific to the feedback mode (SlideViewer, ReactionButtons).
  - `home/`: Components for the landing page.
  - `slide/`: Core slide management components (SlideViewer, ScriptBox, SlideList).
  - `video/`: Video recording and playback components.
- **`src/constants/`**: Constant values, configuration, and mock data.
- **`src/hooks/`**: Custom React hooks.
  - `queries/`: TanStack Query hooks for data fetching.
- **`src/mocks/`**: MSW (Mock Service Worker) handlers and mock data generators.
- **`src/pages/`**: Page-level components acting as route targets.
  - `dev-test/`: Developer testing pages.
- **`src/stores/`**: Zustand stores for global state (e.g., `slideStore.ts`, `themeStore.ts`).
- **`src/styles/`**: Global styles, Tailwind configuration, and design tokens.
- **`src/types/`**: TypeScript type definitions.
- **`src/utils/`**: Utility functions (formatting, validation, etc.).

## Development Workflow

### Scripts

- **`npm run dev`**: Start the development server.
- **`npm run dev:local`**: Start the development server with MSW (API mocking) enabled.
- **`npm run build`**: Build the project for production (includes TypeScript compilation).
- **`npm run preview`**: Preview the production build locally.
- **`npm run lint`**: Run ESLint to check for code quality issues.
- **`npm run type-check`**: Run the TypeScript type checker without emitting files.
- **`npm run prettier`**: Check code formatting.
- **`npm run prettier:fix`**: Automatically fix code formatting.

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
  - **Components:** Use `export default` at the bottom of the file.
  - **Utils/Hooks:** Use `named export` for individual functions.
- **Styling:** Use Tailwind CSS utility classes. Avoid inline styles where possible.
- **State Management:**
  - Use **Zustand** for global client state (e.g., UI state, themes).
  - Use **TanStack Query** for server state (e.g., API data).
- **Path Alias:** Use `@/` to refer to the `src/` directory.

#### Git Workflow

- **Commits:** Follow Conventional Commits.
  - Format: `type: message (#issue)`
  - Example: `feat: implement login page (#123)`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `design`, `ci`, `perf`
- **Branches:**
  - Format: `type/description-issue`
  - Example: `feat/login-12`

## Architecture Highlights

- **Layout System:**
  - The `Layout` component (`src/components/common/layout/Layout.tsx`) supports a `scrollable` prop.
  - **Home Page:** Uses `scrollable={true}` to allow full-page scrolling.
  - **Slide/Feedback Pages:** Use `scrollable={false}` (default) to fix the viewport height (`100vh`) and handle internal scrolling within specific containers.
- **Slide Data Flow:**
  - Slide data is fetched via `useSlides` (TanStack Query).
  - Local slide interactions (selection, script editing) are managed via `slideStore` (Zustand).
  - Opinions and comments are handled via `useOpinions` and `useComments`.
- **Feedback Mode:**
  - Located at `/feedback/slide/:projectId`.
  - Provides a read-only view of slides with interactive features for audience feedback (comments, reactions).
