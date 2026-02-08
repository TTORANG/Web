# WebSocket 실시간 동기화 테스트 가이드

## 🎯 테스트 목표

브라우저 창을 여러 개 띄워서 한 창에서 입력한 댓글/리액션이 다른 창에 실시간으로 반영되는지 확인합니다.

---

## 🚀 테스트 절차

### 1단계: 개발 서버 실행

```bash
npm run dev
```

- 서버가 `http://localhost:5175` (또는 다른 포트)에서 실행됩니다.

### 2단계: 브라우저 창 2개 열기

1. **Chrome 브라우저 창 1** 열기
2. **Chrome 시크릿 모드 창** 또는 **다른 프로필**로 창 2 열기
   - 시크릿 모드: `Ctrl + Shift + N` (Windows) / `Cmd + Shift + N` (Mac)

### 3단계: 피드백 페이지 접속

두 브라우저 창 모두에서 동일한 프로젝트 피드백 페이지에 접속합니다:

- **비디오 피드백**: `http://localhost:5175/feedback/video/:projectId`
- **슬라이드 피드백**: `http://localhost:5175/feedback/slide/:projectId`

예시:

```
http://localhost:5175/feedback/video/p1
http://localhost:5175/feedback/slide/p1
```

### 4단계: WebSocket 연결 확인

각 브라우저 창의 **우측 하단**에 WebSocket 디버그 UI가 표시됩니다:

- 🟢 **녹색 버튼**: WebSocket 연결 성공
- 🔴 **빨간색 버튼**: 연결 실패

**디버그 UI 확장하기:**

1. 우측 하단의 "WS Connected" 버튼 클릭
2. 연결 상태 및 참여 중인 Room 확인
3. `project:p1` 같은 Room이 표시되면 연결 성공!

### 5단계: 실시간 동기화 테스트

#### 테스트 1: 댓글 실시간 동기화

1. **창 1**에서 댓글 작성
   - 댓글 입력창에 "테스트 댓글 1" 입력
   - "등록" 버튼 클릭

2. **창 2**에서 즉시 확인
   - 몇 초 내로 "테스트 댓글 1"이 자동으로 표시되어야 함
   - 새로고침 없이 자동으로 업데이트됨
   - 토스트 알림: "새 댓글 - 누군가 댓글을 작성했습니다."

#### 테스트 2: 리액션 실시간 동기화

1. **창 2**에서 리액션 버튼 클릭
   - 👍, 👏, 😊 등의 이모지 버튼 클릭

2. **창 1**에서 즉시 확인
   - 리액션 카운트가 자동으로 증가
   - 토스트 알림: "👍 - 누군가 반응했습니다!"

#### 테스트 3: 댓글 삭제 동기화

1. **창 1**에서 자신의 댓글 삭제
2. **창 2**에서 해당 댓글이 자동으로 사라지는지 확인

---

## 🔍 디버깅

### WebSocket 연결이 안 될 때

**증상:**

- 우측 하단 버튼이 빨간색 (Disconnected)
- 브라우저 콘솔에 연결 에러

**해결 방법:**

1. **서버가 WebSocket을 지원하는지 확인**

   ```bash
   # 서버 로그에서 Socket.io 초기화 확인
   [Socket.io] Server initialized
   [Socket.io] Redis Adapter initialized
   ```

2. **환경변수 확인** (`.env.local`)

   ```bash
   VITE_API_URL=https://ttorang-server-407623424780.asia-northeast3.run.app
   ```

3. **브라우저 개발자 도구 확인**
   - F12 → Console 탭
   - `[Socket.io]` 로그 확인
   - 연결 에러 메시지 확인

4. **CORS 이슈**
   - 서버에서 클라이언트 도메인 허용 확인
   - 서버 코드에서 `cors: { origin: "*" }` 설정 확인

### 실시간 동기화가 안 될 때

**증상:**

- WebSocket은 연결되었지만 댓글이 실시간으로 안 보임

**해결 방법:**

1. **Room 입장 확인**
   - 디버그 UI에서 `project:p1` 같은 Room이 보이는지 확인
   - "Get Rooms" 버튼 클릭해서 현재 Room 목록 확인

2. **서버 로그 확인**

   ```bash
   [Socket.io] Client connected
   [Room] Socket xxx joined room: project:p1
   [WebSocket] New comment: {...}
   ```

3. **브라우저 콘솔 확인**
   - `💬 [WebSocket] New comment:` 로그 확인
   - `[Feedback WebSocket] New comment:` 로그 확인

4. **TanStack Query DevTools 확인**
   - F12 → TanStack Query DevTools
   - 캐시가 자동으로 무효화(invalidate)되는지 확인

---

## 📊 예상 동작

### 정상 연결 시 브라우저 콘솔 로그

```
[Socket.io] Connecting to: https://ttorang-server-407623424780.asia-northeast3.run.app
[Socket.io] Auth: JWT
✅ [Socket.io] Connected: abc123
[WebSocket] Joining project: p1
[WebSocket] Joined project: { projectId: "p1", message: "Joined project p1" }
[WebSocket] Current rooms: ["project:p1", "user:456"]
```

### 댓글 작성 시 브라우저 콘솔 로그

**창 1 (댓글 작성자):**

```
POST /videos/:videoId/comments 201 (Created)
```

**창 2 (실시간 수신):**

```
💬 [WebSocket] New comment: {
  commentId: "c123",
  videoId: "v1",
  userId: "u456",
  content: "테스트 댓글 1",
  createdAt: "2024-02-04T12:34:56.789Z"
}
[Feedback WebSocket] New comment: {...}
Invalidating queries: ["presentations", "detail", "p1"]
```

---

## ✅ 성공 기준

- [ ] 두 브라우저 창 모두 WebSocket 연결 성공 (녹색 표시)
- [ ] 창 1에서 작성한 댓글이 창 2에서 **새로고침 없이** 즉시 표시됨
- [ ] 창 2에서 클릭한 리액션이 창 1에서 실시간으로 카운트 증가
- [ ] 토스트 알림이 정상적으로 표시됨
- [ ] 디버그 UI에서 Room 목록에 `project:xxx` 표시됨

---

## 🛠 문제 해결 팁

### 1. WebSocket 연결은 되는데 이벤트가 안 올 때

서버에서 이벤트를 제대로 발행하는지 확인:

```javascript
// 서버 코드에서 확인할 부분
await eventBus.publish(EventTypes.COMMENT_CREATED, {
  projectId: 'p1', // ⚠️ projectId가 반드시 포함되어야 함
  commentId: 'c123',
  videoId: 'v1',
  userId: 'u456',
  content: '테스트',
  createdAt: new Date().toISOString(),
});
```

### 2. 특정 사용자만 이벤트를 받고 싶을 때

```typescript
// 특정 사용자에게만 전송
emitToUser(userId, SocketEvents.NEW_COMMENT, data);
```

### 3. 연결이 자주 끊길 때

- Cloud Run의 타임아웃 설정 확인 (pingTimeout: 60000)
- 네트워크 안정성 확인
- Redis Adapter 연결 상태 확인

---

## 📝 추가 테스트 시나리오

### 다중 사용자 시나리오

1. 브라우저 창 3개 열기 (정상 모드 1개 + 시크릿 모드 2개)
2. 모두 같은 프로젝트 접속
3. 창 1에서 댓글 작성
4. 창 2, 3에서 동시에 실시간 수신 확인

### 네트워크 단절 복구 테스트

1. 브라우저 개발자 도구 → Network 탭
2. "Offline" 체크박스 선택 (네트워크 차단)
3. 몇 초 후 다시 "Offline" 해제
4. WebSocket이 자동으로 재연결되는지 확인

### Room 전환 테스트

1. 창 1: 프로젝트 A 접속
2. 창 2: 프로젝트 B 접속
3. 각 창에서 댓글 작성
4. 서로 다른 프로젝트의 이벤트는 수신되지 않아야 함

---

## 🎉 테스트 완료!

모든 테스트가 통과하면 WebSocket 실시간 동기화가 정상적으로 구현된 것입니다!
