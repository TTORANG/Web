# 컨벤션

## 커밋 컨벤션

| 형식 | `type: 메시지 (#이슈번호)`      |
| :--: | :------------------------------ |
| 예시 | `feat: 로그인 기능 구현 (#123)` |

|    타입    | 설명                         |
| :--------: | :--------------------------- |
|   `feat`   | 새로운 기능                  |
|   `fix`    | 버그 수정                    |
|   `docs`   | 문서 변경                    |
|  `style`   | 코드 포맷팅 (로직 변경 없음) |
| `refactor` | 리팩토링                     |
|   `test`   | 테스트 추가/수정             |
|  `chore`   | 빌드, 설정 등 기타           |
|  `design`  | UI/UX 디자인 변경            |
|    `ci`    | CI/CD 관련 변경              |
|   `perf`   | 성능 개선                    |

## 브랜치 컨벤션

| 형식 | `type/설명#이슈번호` |
| :--: | :------------------- |
| 예시 | `feat/login#12`      |

|    타입    | 설명               |
| :--------: | :----------------- |
|   `feat`   | 새로운 기능        |
|   `fix`    | 버그 수정          |
| `refactor` | 리팩토링           |
|  `design`  | UI/UX 디자인 변경  |
|  `chore`   | 빌드, 설정 등 기타 |
|   `docs`   | 문서 작업          |

## 네이밍 컨벤션

### 폴더 / 파일

| 대상            |     규칙     | 예시                               |
| :-------------- | :----------: | :--------------------------------- |
| 폴더명          | `kebab-case` | `navigation-bar`, `server-actions` |
| 일반 파일 (.ts) | `camelCase`  | `calculate.ts`, `apiClient.ts`     |
| 컴포넌트 (.tsx) | `PascalCase` | `Button.tsx`, `ProductList.tsx`    |

### 변수 / 함수

| 대상   |        규칙        | 예시                                |
| :----- | :----------------: | :---------------------------------- |
| 변수명 |    `camelCase`     | `userName`, `itemCount`             |
| 함수명 |    `camelCase`     | `fetchProducts()`, `handleSubmit()` |
| 상수명 | `UPPER_SNAKE_CASE` | `MAX_COUNT`, `API_URL`              |

### 컴포넌트

| 대상            |        규칙         | 예시                   |
| :-------------- | :-----------------: | :--------------------- |
| 컴포넌트명      |    `PascalCase`     | `Header`, `LoginForm`  |
| 페이지 컴포넌트 | `PascalCase + Page` | `MainPage`, `CartPage` |

### Export 규칙

**컴포넌트**: 하단에 `default export`

```tsx
const ProductList = () => {
  return <div>상품 리스트</div>;
};

export default ProductList;
```

**유틸 함수**: 각 함수를 `named export`

```ts
export const fetchItems = () => {
  /* ... */
};

export const updateUser = () => {
  /* ... */
};
```
