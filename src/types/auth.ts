export type AuthProvider = 'google' | 'kakao' | 'naver';

export interface User {
  id: string;
  name: string;
  email: string;
  provider: AuthProvider;
  profileImage?: string;
}
