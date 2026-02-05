/**
 * 인증 관련 DTO
 */

/**
 * 소셜 로그인 성공 응답의 사용자 정보
 */
export interface SocialLoginUserResponseDto {
  id: string;
  email: string;
  name: string;
  sessionId: string;
}

/**
 * 소셜 로그인 성공 응답의 토큰 정보
 */
export interface SocialLoginTokensResponseDto {
  accessToken: string;
  refreshToken: string;
}

/**
 * 소셜 로그인 성공 응답
 */
export interface SocialLoginSuccessResponseDto {
  message: string;
  user: SocialLoginUserResponseDto;
  tokens: SocialLoginTokensResponseDto;
}

//위 형식대로 response, request dto 작성 부탁드립니다.
