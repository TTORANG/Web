# 웹소켓 실시간 통신 구현 가이드

## 📋 개요

Socket.IO를 사용한 실시간 댓글/리액션 시스템이 구현되었습니다.
백엔드 서버와 연동하여 피드백 페이지에서 실시간 동기화를 지원합니다.

---

## 🔧 설치된 패키지

```json
{
  "socket.io-client": "^4.x.x"
}
```

---

## 📁 생성된 파일

### 1. 타입 정의

- **[src/types/websocket.ts](src/types/websocket.ts)** - 웹소켓 이벤트 타입 정의

### 2. 커스텀 훅

- **[src/hooks/useWebSocket.ts](src/hooks/useWebSocket.ts)** - 기본 웹소켓 연결 훅
- **[src/hooks/useFeedbackWebSocket.ts](src/hooks/useFeedbackWebSocket.ts)** - 피드백 페이지용 웹소켓 훅

### 3. 적용된 페이지

- **[src/pages/FeedbackSlidePage.tsx](src/pages/FeedbackSlidePage.tsx)** - 슬라이드 피드백 페이지
- **[src/pages/FeedbackVideoPage.tsx](src/pages/FeedbackVideoPage.tsx)** - 비디오 피드백 페이지

### 4. 환경 변수

- **[.env.development](.env.development)** - `VITE_WS_URL` 추가
- **[.env.example](.env.example)** - 웹소켓 URL 예시 추가
- **[src/vite-env.d.ts](src/vite-env.d.ts)** - 환경 변수 타입 추가

---

## 🌐 환경 변수 설정

### .env.development

# MSW 목업 활성화 (서버 API 미완성 시)

VITE_API_MOCKING=true

````

### 로컬 테스트용 .env.local

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
VITE_APP_TITLE=또랑 (로컬)
VITE_API_MOCKING=false
````

---

## 🔌 웹소켓 연결 방식

### 1. 인증

```typescript
// JWT 토큰이 있으면 인증된 사용자
// 없으면 익명 사용자로 자동 연결
const socket = io(wsUrl, {
  auth: {
    token: accessToken || null, // JWT 토큰 (선택)
    sessionId: getOrCreateSessionId(), // 익명 사용자 ID
  },
});
```

### 2. Room 구독

```typescript
// 프로젝트 페이지 진입 시 자동으로 Room 입장
socket.emit('join-project', { projectId: 123 });

// 서버 응답
socket.on('joined-project', (data) => {
  // { projectId: 123, message: "Joined project 123" }
});
```

### 3. 실시간 이벤트 수신

```typescript
// 새 댓글
socket.on('new-comment', (data) => {
  // { commentId, videoId, userId, content, createdAt }
});

// 새 리액션
socket.on('new-reaction', (data) => {
  // { reactionId, videoId, userId, emoji, timestamp }
});

// 리액션 카운트 갱신
socket.on('reaction-count-updated', (data) => {
  // { videoId, counts: { thumbs_up: 15, heart: 8 } }
});
```

---

## 🎯 주요 이벤트

### 클라이언트 → 서버

| 이벤트명        | 페이로드                | 설명                     |
| --------------- | ----------------------- | ------------------------ |
| `join-project`  | `{ projectId: number }` | 프로젝트 Room 입장       |
| `leave-project` | `{ projectId: number }` | 프로젝트 Room 퇴장       |
| `get-rooms`     | (없음)                  | 참여 중인 Room 목록 조회 |

### 서버 → 클라이언트

| 이벤트명                 | 페이로드                                             | 설명               |
| ------------------------ | ---------------------------------------------------- | ------------------ |
| `joined-project`         | `{ projectId, message }`                             | Room 입장 확인     |
| `left-project`           | `{ projectId, message }`                             | Room 퇴장 확인     |
| `rooms-list`             | `{ rooms: string[] }`                                | Room 목록 응답     |
| `new-comment`            | `{ commentId, videoId, userId, content, createdAt }` | 새 댓글 알림       |
| `comment-deleted`        | `{ commentId }`                                      | 댓글 삭제 알림     |
| `new-reaction`           | `{ reactionId, videoId, userId, emoji, timestamp }`  | 새 리액션 알림     |
| `reaction-removed`       | `{ reactionId }`                                     | 리액션 제거 알림   |
| `reaction-count-updated` | `{ videoId, counts: object }`                        | 리액션 카운트 갱신 |
| `error`                  | `{ message: string }`                                | 에러 발생          |

---

## ⚠️ 중요 사항

### 1. 댓글/리액션 생성은 REST API 사용

**웹소켓으로 댓글/리액션을 생성하지 않습니다!**

```typescript
// ✅ 올바른 방법: REST API 호출
await fetch('/videos/123/comments', {
  method: 'POST',
  body: JSON.stringify({ content: '좋은 발표입니다!', timestampMs: 2000 }),
});

// → 서버가 DB 저장 후 자동으로 'new-comment' 웹소켓 이벤트 브로드캐스트
```

### 2. 자동 재연결

- 네트워크 끊김 시 자동으로 재연결 시도 (최대 5회)
- 재연결 성공 시 자동으로 Room 재입장

### 3. 익명 사용자

- JWT 토큰 없이도 연결 가능
- 로컬스토리지에 `sessionId` 저장하여 익명 사용자 식별

---

## 🧪 테스트 방법

### 1. 로컬 테스트 (같은 프로젝트)

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 여러 탭 열기
http://localhost:5173/feedback/slide/p1
http://localhost:5173/feedback/slide/p1
http://localhost:5173/feedback/slide/p1

# 한 탭에서 댓글 작성 → REST API 호출
# → 서버가 웹소켓으로 브로드캐스트
# → 다른 탭에서 실시간 수신
```

### 2. 콘솔 로그 확인

```
✅ [WebSocket] Connected: abc123
[WebSocket] Joined project: { projectId: 123, message: "..." }
[WebSocket] Current rooms: ["project:123", "user:456"]
[WebSocket Event] new-comment { commentId: 789, ... }
```

### 3. 네트워크 끊김 테스트

```
1. 개발자 도구 → Network 탭 → Offline 체크
2. 콘솔에 "Disconnected" 메시지 확인
3. Offline 체크 해제
4. 자동 재연결 확인
```

---

## 🔍 디버깅

### 개발 환경에서 모든 이벤트 로깅

```typescript
// useWebSocket.ts에서 자동 활성화 (DEV 모드)
socket.onAny((eventName, ...args) => {
  console.log('[WebSocket Event]', eventName, args);
});
```

### 연결 상태 확인

```typescript
const { isConnected, currentRooms } = useFeedbackWebSocket({
  projectId: 'p1',
  enabled: true,
});

console.log('Connected:', isConnected);
console.log('Rooms:', currentRooms);
```

---

## 📝 TODO

### 현재 구현 상태

- ✅ Socket.IO 클라이언트 설치
- ✅ 환경 변수 설정
- ✅ 타입 정의
- ✅ useWebSocket 훅 구현
- ✅ useFeedbackWebSocket 훅 구현
- ✅ 피드백 페이지 연결
- ✅ 자동 재연결
- ✅ Room 관리

### 추가 작업 필요

- [ ] **서버 데이터 → 로컬 타입 변환 로직**
  - `NewCommentPayload` → `Comment` 타입 변환
  - `NewReactionPayload` → Zustand 스토어 업데이트

- [ ] **Optimistic UI 통합**
  - REST API 호출 → 즉시 로컬 스토어 업데이트
  - 웹소켓 수신 → 다른 사용자 변경사항 반영
  - 충돌 방지 로직 (본인이 작성한 것은 중복 추가하지 않기)

- [ ] **토스트 메시지 개선**
  - 본인이 작성한 댓글인지 구분
  - 새 댓글/리액션 알림 UI 커스터마이징

- [ ] **에러 처리 강화**
  - 재연결 실패 시 폴백 로직
  - 네트워크 상태 표시 UI

---

## 🚀 배포 체크리스트

### 1. 환경 변수 확인

- [ ] Dev: `VITE_WS_URL` 설정
- [ ] Staging: `VITE_WS_URL` 설정
- [ ] Production: `VITE_WS_URL` 설정

### 2. 보안 설정

- [ ] 백엔드 CORS 설정 확인 (운영 환경에서는 `origin: "*"` 제거)
- [ ] JWT 토큰 만료 시 재인증 로직

### 3. 성능 최적화

- [ ] 불필요한 재렌더링 방지
- [ ] 웹소켓 이벤트 핸들러 메모이제이션

---

## 📞 문의

웹소켓 관련 문제 발생 시:

1. 브라우저 콘솔 로그 확인
2. 네트워크 탭에서 WebSocket 연결 상태 확인
3. 서버 담당자에게 백엔드 로그 확인 요청

---

## 📚 참고 자료

- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)
- [백엔드 웹소켓 서버 스펙](../docs/websocket-spec.md) (생성 필요)
- [노션 기능명세서](https://www.notion.so/jeongjehoon/2a9357be62b780f0a00efc16bb466b04?p=2ca357be62b7807bbedec7565fac4b42&pm=s)
