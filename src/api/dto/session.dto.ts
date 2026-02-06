/**
 * 익명 세션 발급 관련 DTO
 */

export interface CreateAnonymousSessionResponseDto {
  message: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  expiresAt: string;
}
