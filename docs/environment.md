# 환경 변수 설정

## 파일 구조

```
.env.example          # 변수 목록 예시 (Git에 포함됨)
.env.local.example    # 로컬 개발용 예시 (Git에 포함됨)
.env.development      # 개발 서버 설정 (Git에서 제외됨)
.env.production       # 프로덕션 설정 (Git에서 제외됨)
.env.local            # 로컬 개발용 (Git에서 제외됨)
```

## 환경 변수 목록

| 변수명           | 설명         | 예시                  |
| ---------------- | ------------ | --------------------- |
| `VITE_API_URL`   | API 서버 URL | `https://example.com` |
| `VITE_APP_TITLE` | 앱 타이틀    | `또랑`                |

## 스크립트

| 명령어              | 환경        | 설명                 |
| ------------------- | ----------- | -------------------- |
| `npm run dev`       | development | 개발 서버에 연결     |
| `npm run dev:local` | local       | 로컬 API 서버에 연결 |
| `npm run build`     | production  | 프로덕션 빌드        |
| `npm run build:dev` | development | 개발 환경 빌드       |

## 로컬 개발 설정

로컬 API 서버에 연결하려면:

```bash
# 1. 예시 파일 복사
cp .env.local.example .env.local

# 2. .env.local 파일 수정
VITE_API_URL=http://localhost:8000

# 3. 로컬 모드로 실행
npm run dev:local
```

## 환경별 우선순위

Vite는 다음 순서로 환경 변수를 로드합니다 (나중에 로드된 값이 우선시됩니다):

1. `.env` - 모든 환경
2. `.env.local` - 모든 환경, Git에서 제외됨
3. `.env.[mode]` - 특정 모드 (development, production, local)
4. `.env.[mode].local` - 특정 모드, Git에서 제외됨

## 코드에서 사용

```typescript
// 환경 변수 접근
const apiUrl = import.meta.env.VITE_API_URL;
const appTitle = import.meta.env.VITE_APP_TITLE;

// 타입 정의는 src/vite-env.d.ts에 있음
```

## 주의사항

- `VITE_` 접두사가 있는 변수만 클라이언트에 노출됩니다
- 환경 변수 파일은 Git에 커밋하지 않습니다
- 배포 환경에서는 CI/CD 플랫폼에서 환경 변수를 설정해야 합니다
