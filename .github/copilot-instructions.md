# Copilot 코드 리뷰 지침

> 한글로 리뷰해주세요

---

## 기술 스택

- **Framework:** React 19 + TypeScript 5.9
- **Build:** Vite 7
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand (persist + devtools middleware)
- **Data Fetching:** TanStack Query + Axios
- **Routing:** React Router v7
- **Mocking:** MSW (개발 환경)
- **Node:** 22 (`.nvmrc` 참조)

---

## 네이밍 컨벤션

| 대상                 | 규칙                | 예시              |
| -------------------- | ------------------- | ----------------- |
| 폴더명               | `kebab-case`        | `user-profile/`   |
| 일반 파일 (.ts)      | `camelCase`         | `apiClient.ts`    |
| 컴포넌트 파일 (.tsx) | `PascalCase`        | `UserCard.tsx`    |
| 변수/함수명          | `camelCase`         | `getUserName`     |
| 상수명               | `UPPER_SNAKE_CASE`  | `MAX_RETRY_COUNT` |
| 컴포넌트명           | `PascalCase`        | `UserCard`        |
| 페이지 컴포넌트      | `PascalCase + Page` | `MainPage`        |
| 타입/인터페이스      | `PascalCase`        | `UserProps`       |

---

## 폴더 구조

```
src/
├── api/
│   ├── client.ts           # Axios 인스턴스 (토큰 자동 주입)
│   └── endpoints/          # 도메인별 API 함수 (slides.ts, opinions.ts 등)
├── components/
│   ├── common/             # 재사용 UI 컴포넌트 + 레이아웃
│   ├── slide/              # 슬라이드 뷰어 (SlideWorkspace, SlideViewer 등)
│   │   └── script/         # 스크립트 편집 모듈
│   ├── feedback/           # 피드백 뷰
│   ├── comment/            # 중첩 댓글 시스템
│   ├── projects/           # 프로젝트 카드
│   └── auth/               # 인증 모달
├── constants/              # 상수
├── hooks/
│   ├── queries/            # TanStack Query 훅 (useSlides, useUpdateSlide 등)
│   └── useSlideSelectors.ts # Zustand 셀렉터 훅
├── pages/                  # 페이지 컴포넌트
├── router/                 # 라우터 설정
├── stores/                 # Zustand 스토어 (authStore, slideStore 등)
├── styles/                 # 글로벌 스타일, 디자인 토큰
└── utils/                  # 유틸 함수
```

---

## 상태 관리 (Zustand)

### 5개 도메인별 스토어

- `authStore` - 인증 상태 (user, tokens, login modal)
- `slideStore` - 슬라이드 데이터 (script, opinions, history, reactions)
- `themeStore` - 테마 관리 (시스템 설정 감지)
- `homeStore` - 홈 페이지 UI 상태 (검색, 뷰 모드, 정렬)
- `shareStore` - 공유 모달 워크플로우

### 셀렉터 패턴

```typescript
// 권장: 셀렉터 훅 사용 (불필요한 리렌더링 방지)
const title = useSlideTitle();
const script = useSlideScript();

// 비권장: 직접 스토어 접근
const title = useSlideStore((s) => s.title);
```

---

## 데이터 페칭 (TanStack Query + Axios)

### 3계층 아키텍처

1. **Axios Client** (`src/api/client.ts`) - Bearer 토큰 자동 주입
2. **API Endpoints** (`src/api/endpoints/`) - 도메인별 async 함수
3. **Query Hooks** (`src/hooks/queries/`) - TanStack Query 래퍼

### Query Key 패턴

```typescript
queryKeys = {
  slides: {
    all: ['slides'],
    list: (projectId) => ['slides', 'list', projectId],
    detail: (slideId) => ['slides', 'detail', slideId],
  },
};
```

---

## 라우팅 구조

```
/                          → HomePage
/:projectId
├── /slide/:slideId        → SlidePage
├── /video                 → VideoPage
└── /insight               → InsightPage
/feedback/slide/:projectId → FeedbackSlidePage
/dev                       → DevTestPage
```

---

## Export 규칙

- **컴포넌트:** `export default` (파일 하단)
- **유틸/훅:** `named export`
- **타입:** `export type` / `export interface`
- **Barrel exports:** `components/common/index.ts`, `hooks/index.ts`, `pages/index.ts` 활용

---

## 스타일링

### Tailwind CSS

- `style` 속성보다 Tailwind 유틸리티 클래스를 우선 사용해주세요
- 색상은 디자인 시스템 팔레트를 사용해주세요 (`text-gray-600`, `bg-main`)

### 디자인 토큰

```css
/* 색상 */
--color-main, --color-gray-{100-900}, --color-error, --color-success

/* 타이포그래피 */
.text-body-m, .text-body-s, .text-caption
```

### 단위

- `px` 대신 `rem`을 사용해주세요

---

## React 패턴

### 컴포넌트

- Props는 `interface`로 정의해주세요
- 비즈니스 로직(Custom Hooks)과 UI(Component)를 분리해주세요

### Hooks

- `useEffect` 의존성 배열이 올바른지 확인해주세요
- 불필요한 리렌더링이 발생할 수 있는 코드인지 확인해주세요

### 라우팅

- `<a>` 태그 대신 `<Link>` 또는 `useNavigate`를 사용해주세요 (SPA 동작 보장)

## 코드 품질

- 불필요한 `console.log`가 있는지 확인해주세요
- 사용하지 않는 import가 있는지 확인해주세요
- TypeScript 타입이 `any`로 되어있는지 확인해주세요
- 하드코딩된 값이 상수로 분리되어야 하는지 확인해주세요
- 매직 넘버는 의미 있는 상수명으로 분리해주세요

---

## 접근성 (Accessibility)

- 의미 없는 `<div>` 대신 시맨틱 태그를 적극 사용해주세요
- 모든 이미지(`<img>`)에는 적절한 `alt` 텍스트를 제공해주세요
- 버튼과 링크는 명확한 레이블을 가져야 합니다
- `role`, `aria-*` 속성을 적절히 사용해주세요

---

## 보안

- API 키나 민감한 정보가 하드코딩되어 있는지 확인해주세요
- 환경변수는 `VITE_` 접두사를 사용해야 합니다
- `import.meta.env.VITE_*`로 접근

---

## 환경변수

```bash
VITE_API_URL        # API 서버 URL
VITE_APP_TITLE      # 앱 타이틀 (default: "또랑")
VITE_KAKAO_JS_KEY   # 카카오 JavaScript 키
VITE_API_MOCKING    # MSW 활성화 ("true")
```

---

## Path Alias

`@/*` → `./src/*` (tsconfig, vite.config 설정)

---

## Git 커밋 컨벤션

```
<type>: <subject> (#issue)

feat: 새로운 기능
fix: 버그 수정
refactor: 리팩토링
style: 코드 포맷팅
chore: 기타 작업
docs: 문서 수정
design: UI/UX 변경
ci: CI 설정
perf: 성능 개선
test: 테스트
```

## 브랜치 컨벤션

```
<type>/<description>-<issue>

예: feat/login-12
```
