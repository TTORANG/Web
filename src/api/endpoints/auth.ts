/**
 * @file auth.ts
 * @description 인증 관련 API 엔드포인트
 */
import { apiClient } from '@/api/client';
import type { SocialLoginSuccessResponseDto } from '@/api/dto';
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
export async function getGoogleCallback(code: string): Promise<SocialLoginSuccessResponseDto> {
  const response = await apiClient.get<ApiResponse<SocialLoginSuccessResponseDto>>(
    `/auth/google/callback`,
    { params: { code } },
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * Kakao OAuth 콜백 처리
 *
 * @param code - OAuth 인증 코드
 * @returns 로그인 성공 정보 (user, tokens)
 *
 * @example
 * const result = await getKakaoCallback('authorization-code');
 */
export async function getKakaoCallback(code: string): Promise<SocialLoginSuccessResponseDto> {
  const response = await apiClient.get<ApiResponse<SocialLoginSuccessResponseDto>>(
    `/auth/kakao/callback`,
    {
      params: { code },
    },
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * Naver OAuth 콜백 처리
 *
 * @param code - OAuth 인증 코드
 * @returns 로그인 성공 정보 (user, tokens)
 *
 * @example
 * const result = await getNaverCallback('authorization-code');
 */
export async function getNaverCallback(code: string): Promise<SocialLoginSuccessResponseDto> {
  const response = await apiClient.get<ApiResponse<SocialLoginSuccessResponseDto>>(
    `/auth/naver/callback`,
    {
      params: { code },
    },
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}
