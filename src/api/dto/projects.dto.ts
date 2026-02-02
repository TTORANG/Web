/**
 * @file projects.dto.ts
 * @description 프로젝트 API 요청 DTO
 */

export interface CreateProjectDto {
  title: string;
}

export interface UpdateProjectDto {
  title?: string;
}
