# Copilot 코드 리뷰 지침

## 언어

- 한글로 리뷰해주세요

## 네이밍 컨벤션

- 폴더명: `kebab-case`
- 일반 파일(.ts): `camelCase`
- 컴포넌트 파일(.tsx): `PascalCase`
- 변수/함수명: `camelCase`
- 상수명: `UPPER_SNAKE_CASE`
- 컴포넌트명: `PascalCase`
- 페이지 컴포넌트: `PascalCase + Page` (예: `MainPage`)

## Export 규칙

- 컴포넌트: `export default`
- 유틸 함수: `named export`

## 코드 품질

- 불필요한 `console.log`가 있는지 확인해주세요
- 사용하지 않는 import가 있는지 확인해주세요
- TypeScript 타입이 `any`로 되어있는지 확인해주세요
- 하드코딩된 값이 상수로 분리되어야 하는지 확인해주세요

## React

- 컴포넌트 props는 interface로 정의해주세요
- useEffect 의존성 배열이 올바른지 확인해주세요
- 불필요한 리렌더링이 발생할 수 있는 코드인지 확인해주세요

## 보안

- API 키나 민감한 정보가 하드코딩되어 있는지 확인해주세요
- 환경변수는 `VITE_` 접두사를 사용해야 합니다
