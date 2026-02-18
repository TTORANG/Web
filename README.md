# 또랑

프레젠테이션 슬라이드를 업로드하고, 발표 영상을 녹화하여 실시간 피드백을 주고받을 수 있는 협업 플랫폼입니다.

## 기술 스택

<div align="center">

|       Type       |                                                                                                                 Tool                                                                                                                  |
| :--------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|     Bundler      |                                                                    ![VITE](https://img.shields.io/badge/VITE-646CFF?style=for-the-badge&logo=Vite&logoColor=white)                                                                    |
|     Library      |                                                             ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)                                                             |
|     Language     |                                                           ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white)                                                           |
|     Styling      |                                                         ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=TailwindCSS&logoColor=white)                                                          |
| State Management |                                                                ![Zustand](https://img.shields.io/badge/Zustand-433E38?style=for-the-badge&logo=react&logoColor=white)                                                                 |
|  Data Fetching   |   ![TanStack Query](https://img.shields.io/badge/-TanStack%20Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)    |
|     Testing      | ![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white) ![Testing Library](https://img.shields.io/badge/Testing_Library-E33332?style=for-the-badge&logo=testinglibrary&logoColor=white) |
|    E2E / A11y    |       ![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white) ![axe-core](https://img.shields.io/badge/axe--core-5A0FC8?style=for-the-badge&logo=axe&logoColor=white)       |
|     Mocking      |                                                              ![MSW](https://img.shields.io/badge/MSW-FF6A33?style=for-the-badge&logo=mockserviceworker&logoColor=white)                                                               |
|     Routing      |                                                        ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)                                                        |
|    Formatting    |           ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)           |
| Package Manager  |                                                                     ![Npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)                                                                      |
| Version Control  |           ![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)            |
|  Collaboration   |                                                                 ![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)                                                                 |

</div>

## 시작하기

> Node 22 이상이 필요합니다. (`.nvmrc` 참고)

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 백엔드 없이 목 데이터로 실행
npm run dev:local
```

환경 변수 설정은 [환경 변수 문서](./docs/environment.md)를 참고하세요.

## 개발 명령어

| 명령어                        | 설명                           |
| ----------------------------- | ------------------------------ |
| `npm run dev`                 | 개발 서버 실행                 |
| `npm run dev:local`           | MSW 목 데이터로 개발 서버 실행 |
| `npm run build`               | 타입 체크 + 프로덕션 빌드      |
| `npm run type-check`          | TypeScript 타입 체크           |
| `npm run lint`                | ESLint 검사                    |
| `npm run prettier`            | Prettier 포맷 검사             |
| `npm run prettier:fix`        | Prettier 자동 포맷             |
| `npm run test`                | 테스트 실행                    |
| `npm run test:watch`          | 테스트 워치 모드               |
| `npm run test:coverage`       | 테스트 커버리지 리포트         |
| `npm run audit:mobile-tablet` | 모바일/태블릿 접근성 감사 실행 |

## 프로젝트 구조

```
src/
├── api/                # Axios 클라이언트, 엔드포인트, 에러 핸들링
│   ├── dto/            #   요청/응답 DTO 타입
│   └── endpoints/      #   도메인별 API 함수
├── assets/             # 이미지, 아이콘 등 정적 리소스
├── bootstrap/          # 앱 초기화 (MSW 등)
├── components/         # UI 컴포넌트
│   ├── auth/           #   인증 모달
│   ├── comment/        #   중첩 댓글 시스템
│   ├── common/         #   공통 UI (Modal, Dropdown, Layout 등)
│   ├── feedback/       #   발표 피드백 뷰
│   ├── home/           #   홈 페이지
│   ├── insight/        #   인사이트/분석
│   ├── presentation/   #   프레젠테이션 카드/목록
│   ├── share/          #   공유 모달
│   ├── slide/          #   슬라이드 편집기 (SlideWorkspace 중심)
│   └── video/          #   영상 녹화/재생
├── constants/          # 상수 정의
├── hooks/              # 커스텀 훅
│   └── queries/        #   TanStack Query 훅
├── mocks/              # MSW 핸들러
├── pages/              # 페이지 컴포넌트
├── providers/          # Context Provider
├── router/             # 라우트 설정
├── stores/             # Zustand 스토어 (6개 도메인)
├── styles/             # 글로벌 스타일, 디자인 토큰
├── test/               # 테스트 유틸리티, 설정
├── types/              # 공통 타입 정의
└── utils/              # 유틸리티 함수
```

## 문서

- [기술 선택 이유](./docs/tech-stack.md)
- [컨벤션](./CONVENTION.md)
- [환경 변수 설정](./docs/environment.md)
- [슬라이드 데이터 흐름](./docs/slide-data-flow.md)
- [API 연동 가이드](./docs/api-connect.md)
- [WebSocket 구현](./docs/websocket-implementation.md)
