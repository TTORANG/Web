/**
 * 프로젝트 제목 수정 요청 DTO
 */
export interface UpdateProjectDto {
  title?: string;
}

/**
 * 프로젝트 제목 수정 응답 DTO
 */
export interface UpdateProjectResponseDto {
  projectId: string;
  title: string;
  updatedAt: string;
}

/**
 * 프로젝트 목록 조회 요청 DTO
 */
export interface GetPresentationsRequestDto {
  page?: number;
  limit?: number;
  search?: string;
  maxDuration?: number;
  sort?: string;
}

/**
 * 프로젝트 삭제 응답 DTO
 */
export interface DeleteProjectResponseDto {
  message: string;
}
