/**
 * @file auth.ts
 * @description 인증 관련 API 엔드포인트
 */
import { apiClient } from '@/api';
import type { SocialLoginSuccessDto } from '@/api/dto';
import type { ApiResponse } from '@/types/api';

/**
 * Google OAuth 콜백 처리
 *
 * @param code - OAuth 인증 코드
 * @returns 로그인 성공 정보 (user, tokens)
 *
 * @example
 * const result = await getGoogleCallback('authorization-code');
 */
export async function getGoogleCallback(code: string): Promise<SocialLoginSuccessDto> {
  const response = await apiClient.get<ApiResponse<SocialLoginSuccessDto>>(
    `/auth/google/callback`,
    { params: { code } },
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}
