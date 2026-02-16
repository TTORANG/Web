# 기술 선택 이유

## React 19

프레젠테이션 편집기의 복잡한 UI 상태(슬라이드 목록, 스크립트 편집, 댓글, 리액션 등)를 **컴포넌트 단위로 분리**하여 관리하기에 적합합니다. React 19의 개선된 렌더링 성능과 풍부한 생태계(React Router, TanStack Query, Zustand 등)를 활용해 빠른 개발 속도를 확보했습니다. Vue나 Svelte 대비 **커뮤니티 규모와 서드파티 라이브러리 호환성**이 압도적이어서, 영상 피드백·차트·공유 등 다양한 기능을 구현할 때 바퀴를 재발명할 필요가 없습니다.

## TypeScript 5.9

프로젝트 전체에 **strict 모드**를 적용하여 런타임 에러를 컴파일 타임에 차단합니다. 슬라이드·댓글·리액션 등 도메인 타입이 복잡하게 얽혀 있는 구조에서, 타입 시스템이 API 응답부터 컴포넌트 props까지 **데이터 흐름의 정합성을 보장**합니다. JavaScript 대비 리팩토링 안전성이 높아 팀 협업 시 실수를 줄여줍니다.

## Vite 7

기존 Webpack/CRA 대비 **ESM 기반 즉시 서버 시작**과 HMR(Hot Module Replacement) 속도가 월등히 빠릅니다. 슬라이드 편집처럼 코드 수정 → 화면 확인 사이클이 잦은 개발 환경에서 생산성을 크게 높여줍니다. SWC 플러그인(`@vitejs/plugin-react-swc`)을 함께 사용하여 Babel 대비 **빌드 속도를 추가로 단축**했습니다.

## Tailwind CSS v4

**유틸리티 퍼스트 방식**으로 별도 CSS 파일 없이 컴포넌트 내에서 스타일을 직접 선언합니다. 디자인 토큰(`--color-main`, `--color-gray-*`)과 결합해 다크 모드·테마 전환을 CSS 변수 교체만으로 구현할 수 있었습니다. v4의 Rust 기반 엔진으로 **빌드 시 CSS 생성 속도가 대폭 개선**되었고, Vite 플러그인(`@tailwindcss/vite`)으로 설정도 간소화됩니다.

## Zustand 5

Redux 대비 **보일러플레이트가 극도로 적으면서**도 DevTools, persist, immer 등 미들웨어를 지원합니다. 프로젝트의 6개 도메인 스토어(`authStore`, `slideStore`, `themeStore` 등)를 각각 독립적으로 관리하면서도, 셀렉터 훅 패턴(`useSlideTitle()`, `useSlideScript()`)으로 **불필요한 리렌더링을 최소화**합니다. `getState()`/`setState()`로 React 외부에서도 접근 가능하여 Axios 인터셉터 내 인증 토큰 주입 같은 패턴을 자연스럽게 구현할 수 있습니다.

## TanStack Query 5 + Axios

**서버 상태와 클라이언트 상태를 명확히 분리**합니다. TanStack Query가 캐싱·리페칭·낙관적 업데이트·에러 재시도를 선언적으로 처리하고, Axios는 인터셉터 기반 **토큰 자동 주입과 중앙화된 에러 핸들링**을 담당합니다. 계층적 쿼리 키 팩토리(`queryKeys.slides.list(projectId)`)로 세밀한 캐시 무효화가 가능해, 슬라이드 수정 시 관련 목록만 정확히 갱신합니다. fetch API 대비 요청 취소, 진행률 추적, 인터셉터 등의 기능을 별도 구현 없이 사용할 수 있습니다.

## React Router v7

**파일 기반이 아닌 설정 기반 라우팅**으로 프로젝트 구조를 유연하게 가져갑니다. 중첩 라우트와 `useParams()`를 활용해 `/:projectId/slide/:slideId` 같은 계층적 URL 구조를 자연스럽게 매핑하고, 라우트별 테마 오버라이드(피드백 페이지 다크 모드)도 props 전달만으로 처리합니다.

## Vitest + React Testing Library

Vite와 **설정을 공유**하여 별도의 테스트 빌드 파이프라인 없이 동일한 경로 별칭(`@/*`)과 환경을 그대로 사용합니다. Jest 호환 API로 학습 비용이 낮으면서도 ESM 네이티브 지원과 병렬 실행으로 **테스트 속도가 빠릅니다**. React Testing Library는 구현 세부사항이 아닌 **사용자 관점의 행동 기반 테스트**를 강제하여, 리팩토링에도 깨지지 않는 안정적인 테스트를 작성할 수 있습니다. `happy-dom`을 환경으로 선택하여 jsdom 대비 **실행 속도를 추가로 개선**했습니다.

## MSW (Mock Service Worker)

Service Worker를 활용해 **네트워크 레벨에서 API를 가로채기** 때문에, 애플리케이션 코드를 수정하지 않고 목 데이터로 개발할 수 있습니다. 백엔드 API가 준비되지 않은 상태에서도 `npm run dev:local`로 전체 기능을 개발·테스트할 수 있어 **프론트엔드와 백엔드의 개발 일정을 분리**합니다. 목 핸들러를 그대로 테스트에서 재사용할 수 있어 일관성도 유지됩니다.

## ESLint + Prettier + Husky

ESLint가 **코드 품질**(미사용 변수, 훅 규칙 위반 등)을, Prettier가 **코드 포맷**(들여쓰기, 따옴표 등)을 각각 담당하여 역할이 겹치지 않습니다. `eslint-plugin-check-file`로 **파일·폴더 네이밍 컨벤션**(kebab-case 폴더, PascalCase 컴포넌트)을 자동 강제하고, Husky + lint-staged로 **커밋 시점에 자동 검사**하여 컨벤션을 위반하는 코드가 저장소에 유입되는 것을 원천 차단합니다.
