/**
 * 상태
 * - guest : 아무것도 없음
 * - anonymous : 익명 (이름: 익명 사용자)
 * - social: 소셜 로그인 (프로필 이미지와 이름 받아옴)
 */
export type AuthStatus = 'guest' | 'anonymous' | 'social';

export type AuthProvider = 'google' | 'kakao' | 'naver';

export interface User {
  id: string;
  name?: string;
  email: string;
  sessionId: string;
  provider?: AuthProvider;
  profileImage?: string;
}
