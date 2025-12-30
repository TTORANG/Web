# Copilot 코드 리뷰 지침

> 한글로 리뷰해주세요

---

## 기술 스택

- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router

---

## 네이밍 컨벤션

| 대상                 | 규칙                | 예시              |
| -------------------- | ------------------- | ----------------- |
| 폴더명               | `kebab-case`        | `user-profile`    |
| 일반 파일 (.ts)      | `camelCase`         | `useAuth.ts`      |
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
├── components/     # 재사용 컴포넌트
│   └── layout/     # 레이아웃 컴포넌트
├── constants/      # 상수
├── hooks/          # 커스텀 훅
├── pages/          # 페이지 컴포넌트
├── router/         # 라우터 설정
├── styles/         # 글로벌 스타일, 디자인 토큰
└── utils/          # 유틸 함수
```

---

## Export 규칙

- **컴포넌트:** `export function` (named export)
- **페이지:** `export default`
- **유틸 함수:** `named export`
- **타입:** `export type` / `export interface`

---

## 스타일링

### Tailwind CSS

- `style` 속성보다 Tailwind 유틸리티 클래스를 우선 사용해주세요
- 임의 값(`w-[35px]`) 사용을 지양하고, 테마에 정의된 값을 사용해주세요
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

## React

### 컴포넌트

- Props는 `interface`로 정의해주세요
- 비즈니스 로직(Custom Hooks)과 UI(Component)를 분리해주세요

### Hooks

- `useEffect` 의존성 배열이 올바른지 확인해주세요
- 불필요한 리렌더링이 발생할 수 있는 코드인지 확인해주세요

### 라우팅

- `<a>` 태그 대신 `<Link>` 또는 `useNavigate`를 사용해주세요 (SPA 동작 보장)

---

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
```
