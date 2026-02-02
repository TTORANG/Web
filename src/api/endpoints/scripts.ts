/**
 * @file scripts.ts
 * @description 대본 관련 API 엔드포인트
 */
import { apiClient } from '@/api/client';
import type { ApiResponse, ScriptResponse, ScriptVersion } from '@/types/api';

/**
 * 대본 조회
 *
 * @param slideId - 슬라이드 ID
 * @returns 대본 정보
 */
export async function getScript(slideId: string): Promise<ScriptResponse> {
  const response = await apiClient.get<ApiResponse<ScriptResponse>>(
    `/presentations/slides/${slideId}/script`,
  );
  return response.data.success;
}

/**
 * 대본 저장 요청 타입
 */
export interface UpdateScriptRequest {
  script: string;
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
  data: UpdateScriptRequest,
): Promise<ScriptResponse> {
  const response = await apiClient.patch<ApiResponse<ScriptResponse>>(
    `/presentations/slides/${slideId}/script`,
    data,
  );
  return response.data.success;
}

/**
 * 대본 버전(히스토리) 목록 조회
 *
 * @param slideId - 슬라이드 ID
 * @returns 버전 목록 (최신순)
 */
export async function getScriptVersions(slideId: string): Promise<ScriptVersion[]> {
  const response = await apiClient.get<ApiResponse<ScriptVersion[]>>(
    `/presentations/slides/${slideId}/versions`,
  );
  return response.data.success;
}

/**
 * 대본 복원 요청 타입
 */
export interface RestoreScriptRequest {
  version: number;
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
  data: RestoreScriptRequest,
): Promise<ScriptResponse> {
  const response = await apiClient.post<ApiResponse<ScriptResponse>>(
    `/presentations/slides/${slideId}/restore`,
    data,
  );
  return response.data.success;
}
