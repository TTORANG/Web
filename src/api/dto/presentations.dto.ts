import type { Presentation } from '@/types/presentation';

/**
 * 새 프로젝트 생성 요청 DTO (POST)
 */
export interface CreatePresentationRequestDto {
  title: string;
  uploadedFileId: string;
}

/**
 * 새 프로젝트 생성 응답 DTO
 */
export interface CreatePresentationResponseDto {
  message: string;
  projectId: string;
  title: string;
  createdAt: string;
}

/**
 * 프로젝트 정렬 타입
 * - latest : 최신순 (default)
 * - name : 이름순(가나다)
 * - feedback : 피드백(댓글) 많은 순
 */
/**
 * 프로젝트 목록 조회 및 검색 요청 DTO (GET)
 */
export interface GetPresentationsRequestDto {
  page?: number;
  limit?: number;
  search?: string;
  maxDuration?: number;
  sort?: string;
}

/**
 * 프로젝트 목록 조회 응답 DTO
 */
export interface GetPresentationsResponseDto {
  presentations: Presentation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 프로젝트 제목 수정 요청 DTO (PATCH)
 */
export interface UpdatePresentationRequestDto {
  title?: string;
}

/**
 * 프로젝트 삭제 응답 DTO (DELETE)
 */
export interface DeletePresentationResponseDto {
  message: string;
}
