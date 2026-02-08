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
export type PresentationSort = 'latest' | 'name' | 'feedback';

/**
 * 프로젝트 목록 조회 및 검색 요청 DTO (GET)
 */
export interface SearchPresentationListRequestDto {
  page?: number;
  limit?: number;
  search?: string;
  maxDuraton?: number;
  sort?: PresentationSort;
}

/**
 * 프로젝트 목록 조회 응답 DTO
 */
export interface SearchPresentationListResponseDto {
  presentations: Array<{
    projectId: string;
    title: string;
    thumbnailUrl: string;
    slideCount: number;
    reactionCount: number;
    viewCount: number;
    feedbackCount: number;
    durationSeconds: number;
    createdAt: string;
    updatedAt: string;
  }>;
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
 * 프로젝트 제목 수정 응답 DTO
 */
export interface UpdatePresentationResponseDto {
  projectId: string;
  title: string;
  updatedAt: string;
}

/**
 * 프로젝트 삭제 응답 DTO (DELETE)
 */
export interface DeletePresentationResponseDto {
  message: string;
}
