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
