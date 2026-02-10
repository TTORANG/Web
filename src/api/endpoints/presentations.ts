/**
 * @file presentations.ts
 * @description 프로젝트 관련 API 엔드포인트
 *
 * 서버와 통신하는 함수들을 정의합니다.
 * 이 함수들은 직접 호출하지 않고, hooks/queries에서 사용합니다.
 */
import { apiClient } from '@/api/client';
import type { UpdatePresentationRequestDto } from '@/api/dto';
import type { ApiResponse, ConversionStatusResponse } from '@/types/api';
import type {
  Presentation,
  PresentationListResponse,
  UpdatePresentationResponse,
} from '@/types/presentation';

import type {
  CreatePresentationRequestDto,
  CreatePresentationResponseDto,
  DeletePresentationResponseDto,
  GetPresentationsRequestDto,
} from '../dto/presentations.dto';

/**
 * 새 프로젝트 생성 (POST)
 *
 * @param data
 * @returns
 */
export async function createPresentation(
  data: CreatePresentationRequestDto,
): Promise<CreatePresentationResponseDto> {
  const response = await apiClient.post<ApiResponse<CreatePresentationResponseDto>>(
    '/presentations',
    data,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 프로젝트 목록 조회 (GET)
 *
 * @returns Presentation[]
 */
export async function getPresentations(
  params?: GetPresentationsRequestDto,
): Promise<PresentationListResponse> {
  const response = await apiClient.get<ApiResponse<PresentationListResponse>>(`/presentations`, {
    params,
  });

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 프로젝트 상세 조회
 *
 * @param projectId
 * @returns Presentation
 */
export async function getPresentation(projectId: string): Promise<Presentation> {
  const response = await apiClient.get<ApiResponse<Presentation>>(`/presentations/${projectId}`);

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 프로젝트 제목 수정 (PATCH)
 *
 * @param projectId
 * @param data - 수정할 프로젝트 데이터
 * @returns UpdatePresentationResponse - 수정된 프로젝트 정보
 */
export async function updatePresentation(
  projectId: string,
  data: UpdatePresentationRequestDto,
): Promise<UpdatePresentationResponse> {
  const response = await apiClient.patch<ApiResponse<UpdatePresentationResponse>>(
    `/presentations/${projectId}`,
    data,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 프로젝트 삭제 (DELETE)
 *
 * @param projectId
 */
export async function deletePresentation(
  projectId: string,
): Promise<DeletePresentationResponseDto> {
  const response = await apiClient.delete<ApiResponse<DeletePresentationResponseDto>>(
    `/presentations/${projectId}`,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 프로젝트 파일 변환 상태 조회 (GET)
 *
 * @param projectId - 프로젝트 ID
 * @returns ConversionStatusResponse - 변환 상태 정보
 */
export async function getConversionStatus(projectId: string): Promise<ConversionStatusResponse> {
  const response = await apiClient.get<ApiResponse<ConversionStatusResponse>>(
    `/presentations/${projectId}/status`,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}
