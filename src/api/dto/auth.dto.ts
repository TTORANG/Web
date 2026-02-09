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
 * refreshToken은 HttpOnly 쿠키로 전달되므로 응답 body에 포함되지 않음
 */
export interface SocialLoginTokensResponseDto {
  accessToken: string;
}

/**
 * 소셜 로그인 성공 응답
 */
export interface SocialLoginSuccessResponseDto {
  message: string;
  user: SocialLoginUserResponseDto;
  tokens: SocialLoginTokensResponseDto;
}

/**
 * JWT payload 타입 (서버 JWT에서 디코딩)
 */
export interface JwtPayloadDto {
  id: string;
  email: string;
  sessionId: string;
}

//위 형식대로 response, request dto 작성 부탁드립니다.
