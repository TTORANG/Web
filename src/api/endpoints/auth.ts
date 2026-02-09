/**
 * @file auth.ts
 * @description 인증 관련 API 엔드포인트
 *
 * OAuth 콜백은 서버가 리다이렉트로 처리하므로 클라이언트 API 호출 불필요.
 * OAuthCallbackPage에서 URL 파라미터 + JWT 디코딩으로 처리합니다.
 */
