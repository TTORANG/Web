<aside>

## 전체 레이어 구조

src/
├── api/
│ ├── dto/ # [서버 규격] Request/Response 인터페이스 정의함
│ │ ├── auth.dto.ts # 인증 관련 DTO
│ │ ├── presentations.dto.ts # 프로젝트 관련 DTO
│ │ └── video.dto.ts # 비디오 업로드/조회 DTO
│ │
│ └── endpoints/ # [통신 로직] 실제 API 호출 및 데이터 변환(toModel)함
│ ├── auth.ts
│ ├── presentations.ts # Repository 역할 수행함
│ └── videos.ts
│
├── hooks/ # [비즈니스 로직] UI에서 호출할 UseCase 성격의 훅임
│ ├── useAuth.ts
│ ├── usePresentation.ts # 데이터 호출, 로딩/에러 상태 관리함
│ └── useVideo.ts
│
└── types/ # [도메인 모델] 앱 내부에서 공통으로 쓰는 순수 데이터 타입임
└── presentation.ts # camelCase로 정제된 프로젝트 모델임

</aside>

## 1. 레이어 구조 및 역할

- **DTO (Data Transfer Object)**: 서버 통신용 데이터 규격임. 서버 스펙(JSON 필드명 등)을 그대로 반영함.
- **Model (Domain Model)**: 앱 내부용 정제 데이터임. UI에서 쓰기 좋게 필드명을 바꾸거나(`camelCase`) 가공한 형태임.
- **Service (Endpoints)**: 실제 통신을 수행하는 로직임. DTO를 받아 서버에 쏘고, 받은 데이터를 Model로 변환(`toModel`)해줌.

---

## 2. 데이터 관리 전략: DTO와 Model 분리

서버의 변경이 UI에 직접적인 영향을 주지 않도록 **DTO**와 **Model** 분리

- **DTO (Data Transfer Object)**: 서버 응답 규격과 1:1 매칭 (`snake_case` 등 서버 스펙 유지).
- **Model (Domain Model)**: 앱 내부에서 사용하는 정제된 데이터 (`camelCase`로 변환 및 UI 친화적 구조).

---

## 3. 구현 가이드

### 1. DTO 정의 (`src/api/dto/`)

- 서버 응답 규격과 1:1 매칭함.
- 서버 필드명이 `snake_case`면 그대로 유지해서 혼선을 방지함.

```jsx
/** 대본 복원 요청 DTO */
export interface RestoreScriptRequestDto {
  version: number;
}

/** 대본 복원 응답 DTO */
export interface RestoreScriptResponseDto {
  script_id: string; // 서버 고유 스펙
  content: string;
  updated_at: string;
}
```

### 2. Service 작성 (`src/api/endpoints/`)

- 실제 `fetch`나 `axios` 호출을 담당함.
- DTO를 받아서 UI에서 쓰기 편한 **Model**로 변환해서 리턴함.

```jsx
import { RestoreScriptRequestDto, RestoreScriptResponseDto } from '../dto/scripts.dto';

export const scriptService = {
  restoreScript: async (projectId: string, dto: RestoreScriptRequestDto) => {
    const response = await fetch(`/projects/${projectId}/scripts/restore`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    const data: RestoreScriptResponseDto = await response.json();

    // Model로 변환해서 반환 (UI 보호)
    return {
      id: data.script_id,
      content: data.content,
      updatedAt: data.updated_at,
    };
  }
};
```

### 3. Hook 작성 (`src/hooks/`)

**UseCase**의 역할을 수행하며, 컴포넌트에서 사용할 상태와 함수를 제공합니다.

```jsx
export const useRestoreScript = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (version: number) => {
    setIsLoading(true);
    try {
      return await scriptService.restoreScript(projectId, { version });
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
};
```

---

## 4. Hook 레이어 (UseCase 역할)

- **역할**: 비즈니스 로직 및 상태 관리 담당함.
- **특징**: `isLoading`, `isError` 같은 통신 상태를 컴포넌트에 전달하고, 필요 시 데이터를 Model로 최종 가공함.
- **장점**: UI 컴포넌트는 훅이 주는 데이터랑 함수만 쓰면 됨.
