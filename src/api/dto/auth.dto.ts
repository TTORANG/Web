/**
 * 인증 관련 DTO
 */

/**
 * 소셜 로그인 성공 응답의 사용자 정보
 */
export interface SocialLoginUserDto {
  id: string;
  email: string;
  name: string;
  sessionId: string;
}

/**
 * 소셜 로그인 성공 응답의 토큰 정보
 */
export interface SocialLoginTokensDto {
  accessToken: string;
  refreshToken: string;
}

/**
 * 소셜 로그인 성공 응답
 */
export interface SocialLoginSuccessDto {
  message: string;
  user: SocialLoginUserDto;
  tokens: SocialLoginTokensDto;
}
