/**
 * @file scripts.ts
 * @description 대본 관련 API 엔드포인트
 */
import { apiClient } from '@/api';
import type {
  GetScriptResponseDto,
  GetScriptVersionHistoryResponseDto,
  RestoreScriptRequestDto,
  UpdateScriptRequestDto,
} from '@/api/dto';
import type { ApiResponse } from '@/types/api';

/**
 * 대본 조회
 *
 * @param slideId - 슬라이드 ID
 * @returns 대본 정보
 */
export async function getScript(slideId: string): Promise<GetScriptResponseDto> {
  const response = await apiClient.get<ApiResponse<GetScriptResponseDto>>(
    `/presentations/slides/${slideId}/script`,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 대본 저장
 *
 * @param slideId - 슬라이드 ID
 * @param data - 저장할 대본 데이터
 * @returns 저장된 대본 정보
 */
export async function updateScript(
  slideId: string,
  data: UpdateScriptRequestDto,
): Promise<GetScriptResponseDto> {
  const response = await apiClient.patch<ApiResponse<GetScriptResponseDto>>(
    `/presentations/slides/${slideId}/script`,
    data,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 대본 버전(히스토리) 목록 조회
 *
 * @param slideId - 슬라이드 ID
 * @returns 버전 목록 (최신순)
 */
export async function getScriptVersions(
  slideId: string,
): Promise<GetScriptVersionHistoryResponseDto[]> {
  const response = await apiClient.get<ApiResponse<GetScriptVersionHistoryResponseDto[]>>(
    `/presentations/slides/${slideId}/versions`,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 대본 복원
 *
 * @param slideId - 슬라이드 ID
 * @param data - 복원할 버전 번호
 * @returns 복원된 대본 정보
 */
export async function restoreScript(
  slideId: string,
  data: RestoreScriptRequestDto,
): Promise<GetScriptResponseDto> {
  const response = await apiClient.post<ApiResponse<GetScriptResponseDto>>(
    `/presentations/slides/${slideId}/restore`,
    data,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}
