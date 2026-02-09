# 웹소켓 로컬 테스트 가이드

## 🎯 목표

여러 브라우저 탭에서 피드백 페이지를 열어두고, 한 탭에서 댓글/리액션을 추가하면 다른 탭에서도 실시간으로 반영되는지 확인합니다.

---

## 📋 준비물

1. ✅ 프론트엔드 코드 (현재 프로젝트)
2. ✅ 백엔드 서버 코드 (`c:\Users\WONHO\dev\Server`)
3. ✅ Node.js 설치 (양쪽 모두)

---

## 🚀 테스트 방법

### **Option 1: 로컬 백엔드 서버 + 프론트엔드 (권장)**

이 방법으로 실제 웹소켓 통신을 테스트할 수 있습니다.

#### 1단계: 백엔드 서버 실행

```bash
# 터미널 1 - 백엔드 서버
cd c:\Users\WONHO\dev\Server

# 서버 실행
npm run dev
# 또는
npm start

# ✅ 확인: "Server is running on port 3000" 메시지
# ✅ 확인: "Socket.IO server initialized" 메시지
```

#### 2단계: .env.local 파일 생성

프론트엔드 폴더에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# 로컬 백엔드 서버 사용
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
VITE_APP_TITLE=또랑 (로컬)
VITE_API_MOCKING=false
```

#### 3단계: 프론트엔드 실행

```bash
# 터미널 2 - 프론트엔드
cd c:\Users\WONHO\dev\Web

# 개발 서버 실행
npm run dev

# ✅ 확인: "Local: http://localhost:5173" 메시지
```

#### 4단계: 브라우저에서 테스트

```
1. 브라우저를 3개 탭으로 열기
   - http://localhost:5173/feedback/slide/p1
   - http://localhost:5173/feedback/slide/p1
   - http://localhost:5173/feedback/slide/p1

2. 개발자 도구 콘솔 확인 (F12)
   ✅ [WebSocket] Connected: abc123
   ✅ [WebSocket] Joined project: { projectId: 123, ... }

3. 첫 번째 탭에서 댓글 작성
   → 입력창에 "테스트 댓글" 입력 후 등록

4. 다른 탭 확인
   → 실시간으로 새 댓글이 표시되는지 확인
   → 콘솔에 "[WebSocket Event] new-comment" 로그 확인

5. 리액션 버튼 클릭
   → 한 탭에서 👍 클릭
   → 다른 탭에서 카운트가 증가하는지 확인
```

---

### **Option 2: 배포된 개발 서버 사용**

백엔드 서버를 실행하지 않고 배포된 개발 서버를 사용합니다.

#### 조건 확인

서버 담당자에게 다음을 확인:

- [ ] 개발 서버에 웹소켓이 활성화되어 있나요?
- [ ] `https://dev-api.ttorang.com`에서 Socket.IO가 실행 중인가요?

#### 설정 파일 (이미 설정됨)

`.env.development` 파일이 이미 다음과 같이 설정되어 있습니다:

```env
VITE_API_URL=https://dev-api.ttorang.com
VITE_WS_URL=https://dev-api.ttorang.com
VITE_APP_TITLE=또랑 (개발)
```

#### 실행

```bash
npm run dev
```

**주의**: 웹소켓 서버가 활성화되지 않았다면 연결 에러가 발생합니다.

---

### **Option 3: 목업 데이터만 사용 (웹소켓 비활성화)**

백엔드 서버 없이 프론트엔드만 테스트합니다. **실시간 동기화는 작동하지 않습니다.**

#### .env.local 파일

```env
VITE_API_URL=
VITE_WS_URL=
VITE_APP_TITLE=또랑 (목업)
VITE_API_MOCKING=true
```

#### 실행

```bash
npm run dev
```

---

## 🔍 문제 해결

### 1. "WebSocket Connection Error: TransportError"

**원인**: 웹소켓 서버가 실행되지 않았거나 접근할 수 없습니다.

**해결**:

1. 백엔드 서버가 실행 중인지 확인

   ```bash
   cd c:\Users\WONHO\dev\Server
   npm run dev
   ```

2. 서버 콘솔에서 확인

   ```
   ✅ Server is running on port 3000
   ✅ Socket.IO server initialized
   ```

3. `.env.local` 파일 확인

   ```env
   VITE_WS_URL=http://localhost:3000  # 올바른 URL?
   ```

4. 브라우저에서 확인
   - http://localhost:3000 접속 시 서버 응답이 있는가?

### 2. "Maximum update depth exceeded" (무한 루프)

**원인**: React 컴포넌트가 계속 재렌더링됨

**해결**: ✅ 이미 수정됨! `useWebSocket.ts`에서 `handlersRef`를 사용하도록 변경했습니다.

### 3. 댓글이 실시간으로 반영되지 않음

**체크리스트**:

- [ ] 백엔드 서버가 실행 중인가?
- [ ] 웹소켓 연결이 성공했는가? (콘솔 확인)
- [ ] 같은 프로젝트 ID 페이지를 보고 있는가?
- [ ] 백엔드 서버에서 웹소켓 이벤트를 브로드캐스트하는가?

**백엔드 확인**:

```javascript
// 백엔드 서버 코드에서 확인할 것
eventBus.publish('comment:created', data); // 이벤트 발행되는가?
broadcastNewComment(data); // 브로드캐스트 함수 호출되는가?
```

### 4. 연결은 성공했는데 Room에 join되지 않음

**콘솔 확인**:

```
✅ [WebSocket] Connected: abc123
❌ [WebSocket] Joined project: ...  ← 이 메시지가 없다면?
```

**해결**:

1. 백엔드 서버의 `join-project` 이벤트 핸들러 확인
2. `projectId`가 올바르게 전달되는지 확인
3. 네트워크 탭에서 WebSocket 메시지 확인

---

## 🎨 테스트 시나리오

### 시나리오 1: 실시간 댓글 동기화

1. **준비**: 브라우저 3개 탭 열기
2. **탭 1**: 댓글 "안녕하세요!" 작성
3. **탭 2, 3**: 실시간으로 댓글이 나타나는지 확인
4. **콘솔**: `[WebSocket Event] new-comment` 로그 확인

### 시나리오 2: 실시간 리액션 동기화

1. **준비**: 브라우저 2개 탭 열기
2. **탭 1**: 👍 리액션 클릭
3. **탭 2**: 카운트가 1 증가하는지 확인
4. **탭 1**: 다시 👍 클릭 (토글)
5. **탭 2**: 카운트가 1 감소하는지 확인

### 시나리오 3: 네트워크 끊김 테스트

1. **준비**: 브라우저 1개 탭 열기
2. **개발자 도구**: Network → Offline 체크
3. **콘솔**: "Disconnected" 메시지 확인
4. **개발자 도구**: Offline 체크 해제
5. **콘솔**: 자동 재연결 확인

---

## 📊 예상 콘솔 로그

### 정상 연결 시

```
[WebSocket] Connecting to: http://localhost:3000
[WebSocket] Auth: Anonymous (anon_1738368000000_abc123)
✅ [WebSocket] Connected: abc123
[WebSocket] Joined project: { projectId: 123, message: "Joined project 123" }
[WebSocket] Current rooms: ["project:123"]
```

### 댓글 작성 시

```
// 탭 1 (작성자)
POST /videos/123/comments → 201 Created

// 탭 2, 3 (다른 사용자)
[WebSocket Event] new-comment {
  commentId: 789,
  videoId: 123,
  userId: 456,
  content: "안녕하세요!",
  createdAt: "2026-02-01T10:30:00Z"
}
```

### 연결 실패 시

```
[WebSocket] Connecting to: http://localhost:3000
🔴 [WebSocket] Connection Error: TransportError: websocket error
⚠️ 토스트: "웹소켓 서버 연결 실패 - 로컬 서버가 실행 중인지 확인하세요"
```

---

## 💡 팁

### 여러 사용자 시뮬레이션

1. **시크릿 모드 사용**
   - Ctrl+Shift+N (Chrome)
   - 서로 다른 세션으로 테스트

2. **다른 브라우저 사용**
   - Chrome, Edge, Firefox 각각 열기
   - 서로 다른 사용자로 인식됨

### 백엔드 로그 확인

```bash
# 백엔드 서버 터미널에서
[Socket.io] User connected: abc123
[Socket.io Auth] Anonymous user connected: abc123
[Room] Socket abc123 joined room: project:123
[WebSocket] Broadcasting new-comment to project:123
```

---

## ✅ 성공 기준

- [ ] 백엔드 서버가 정상 실행됨
- [ ] 프론트엔드가 웹소켓 서버에 연결됨
- [ ] 프로젝트 Room에 join됨
- [ ] 한 탭에서 댓글 작성 시 다른 탭에서 실시간 표시됨
- [ ] 한 탭에서 리액션 클릭 시 다른 탭에서 카운트 갱신됨
- [ ] 네트워크 끊김 후 자동 재연결됨

---

## 📞 도움 요청

문제가 해결되지 않으면:

1. 브라우저 콘솔 로그 캡처
2. 백엔드 서버 콘솔 로그 캡처
3. 네트워크 탭의 WebSocket 연결 상태 확인
4. 서버 담당자에게 문의

---

## 🎓 웹소켓 개념 이해

### 3000번 포트란?

**포트(Port)**: 컴퓨터에서 실행되는 서버를 구분하는 번호입니다.

```
http://localhost:5173  → 프론트엔드 (Vite 개발 서버)
http://localhost:3000  → 백엔드 (Node.js 서버)
http://localhost:8080  → 다른 서버 (예: Spring Boot)
```

### 배포된 서버 vs 로컬 서버

**로컬 서버 (localhost)**

- 내 컴퓨터에서 실행되는 서버
- 다른 사람은 접근 불가
- 테스트/개발 용도

**배포된 서버 (dev-api.ttorang.com)**

- 클라우드에서 실행되는 서버
- 인터넷이 있으면 누구나 접근 가능
- 팀원과 공유 가능

### 웹소켓이 왜 필요한가?

**일반 HTTP (REST API)**

```
프론트 → 서버: "새 댓글 있어?"
서버 → 프론트: "없어"
프론트 → 서버: "새 댓글 있어?"
서버 → 프론트: "없어"
(계속 물어봐야 함 - 폴링)
```

**웹소켓 (Socket.IO)**

```
프론트 ↔ 서버: 연결 유지
서버 → 프론트: "새 댓글 생겼어!" (자동 알림)
서버 → 프론트: "리액션 +1!" (자동 알림)
(서버가 알아서 알려줌)
```

---

이제 백엔드 서버를 실행하고 테스트를 시작하세요! 🚀
