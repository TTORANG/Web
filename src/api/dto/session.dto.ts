/**
 * 익명 세션 발급 관련 DTO
 */

export interface AnonymousSessionResponseDto {
  message: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  expiresAt: string;
}
