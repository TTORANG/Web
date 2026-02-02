/**
 * 프로젝트 수정 요청 DTO
 */
export interface UpdateProjectDto {
  title: string;
}

/**
 * 프로젝트 생성 요청 DTO
 */
export interface CreateProjectDto {
  title: string;
  uploadFileId: string;
}
