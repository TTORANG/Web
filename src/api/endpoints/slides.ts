/**
 * @file slides.ts
 * @description 슬라이드 관련 API 엔드포인트
 *
 * 서버와 통신하는 함수들을 정의합니다.
 * 이 함수들은 직접 호출하지 않고, hooks/queries에서 사용합니다.
 */
import { apiClient } from '@/api';
import type {
  GetSlideResponseDto,
  UpdateSlideResponseDto,
  UpdateSlideTitleRequestDto,
} from '@/api/dto';
import type { ApiResponse } from '@/types/api';
import type { SlideListItem } from '@/types/slide';

/**
 * 프로젝트의 슬라이드 목록 조회
 *
 * @param projectId - 프로젝트 ID
 * @returns 슬라이드 배열
 *
 * @example
 * const slides = await getSlides('project-123');
 */
export async function getSlides(projectId: string): Promise<SlideListItem[]> {
  const response = await apiClient.get<ApiResponse<SlideListItem[]>>(
    `/presentations/${projectId}/slides`,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 특정 슬라이드 조회
 *
 * @param slideId - 슬라이드 ID
 * @returns 슬라이드 정보
 */
export async function getSlide(slideId: string): Promise<GetSlideResponseDto> {
  const response = await apiClient.get<ApiResponse<GetSlideResponseDto>>(
    `/presentations/slides/${slideId}`,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 슬라이드 수정
 *
 * @param slideId - 수정할 슬라이드 ID
 * @param data - 수정할 데이터
 * @returns 수정된 슬라이드
 */
export async function updateSlide(
  slideId: string,
  data: UpdateSlideTitleRequestDto,
): Promise<UpdateSlideResponseDto> {
  const response = await apiClient.patch<ApiResponse<UpdateSlideResponseDto>>(
    `/presentations/slides/${slideId}`,
    data,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 슬라이드 생성
 *
 * @param projectId - 프로젝트 ID
 * @param data - 생성할 슬라이드 데이터
 * @returns 생성된 슬라이드
 */
export async function createSlide(
  projectId: string,
  data: { title: string; script?: string },
): Promise<GetSlideResponseDto> {
  const response = await apiClient.post<ApiResponse<GetSlideResponseDto>>(
    `/presentations/${projectId}/slides`,
    data,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 슬라이드 삭제
 *
 * @param slideId - 삭제할 슬라이드 ID
 */
export async function deleteSlide(slideId: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<null>>(`/presentations/slides/${slideId}`);

  if (response.data.resultType === 'FAILURE') {
    throw new Error(response.data.error.reason);
  }
}
