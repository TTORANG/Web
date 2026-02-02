/**
 * @file projects.ts
 * @description 프로젝트 관련 API 엔드포인트
 *
 * 서버와 통신하는 함수들을 정의합니다.
 * 이 함수들은 직접 호출하지 않고, hooks/queries에서 사용합니다.
 */
import type { CreateProjectDto, UpdateProjectDto } from '@/api/dto';
import type { ApiResponse } from '@/types/api';
import type { Project } from '@/types/project';

import { apiClient } from '../client';

/**
 * 프로젝트 목록 조회
 *
 * 각 프로젝트는 id를 포함하며, 수정/삭제 시 이 id를 사용함.
 * @returns 프로젝트 배열
 */
export async function getProjects(): Promise<Project[]> {
  const response = await apiClient.get<ApiResponse<Project[]>>(`/projects`);

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }

  throw new Error(response.data.error.reason);
}

/**
 * 프로젝트 상세 조회
 *
 * @param projectId - 프로젝트 ID
 */
export async function getProject(projectId: string): Promise<Project> {
  const response = await apiClient.get<ApiResponse<Project>>(`/projects/${projectId}`);

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }

  throw new Error(response.data.error.reason);
}

/**
 * 프로젝트 수정
 *
 * @param projectId - 수정할 프로젝트 ID
 * @param data - 수정할 데이터
 * @returns 수정된 프로젝트
 */
export async function updateProject(projectId: string, data: UpdateProjectDto): Promise<Project> {
  const response = await apiClient.patch<ApiResponse<Project>>(`/projects/${projectId}`, data);

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }

  throw new Error(response.data.error.reason);
}

/**
 * 프로젝트 생성
 *
 * @param data - 생성할 프로젝트 데이터
 * @returns 생성된 프로젝트
 */
export async function createProject(data: CreateProjectDto): Promise<Project> {
  const response = await apiClient.post<ApiResponse<Project>>(`/projects`, data);

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }

  throw new Error(response.data.error.reason);
}

/**
 * 프로젝트 삭제
 *
 * @param projectId - 삭제할 프로젝트 ID
 */
export async function deleteProject(projectId: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(`/projects/${projectId}`);

  if (response.data.resultType === 'SUCCESS') {
    return;
  }

  throw new Error(response.data.error.reason);
}
