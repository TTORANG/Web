// 이 문서는 slides.ts 보고 작성했습니다..
/**
 * @file projects.ts
 * @description 프로젝트 관련 API 엔드포인트
 *
 * 서버와 통신하는 함수들을 정의합니다.
 * 이 함수들은 직접 호출하지 않고, hooks/queries에서 사용합니다.
 */
import type { Project } from '@/types';

import { apiClient } from '../client';

/**
 * 프로젝트 목록 조회
 *
 * 각 프로젝트는 id를 포함하며, 수정/삭제 시 이 id를 사용함.
 * @returns 프로젝트 배열
 */
export async function getProjects(): Promise<Project[]> {
  const response = await apiClient.get<Project[]>(`/projects`);
  return response.data;
}

/**
 * 프로젝트 수정 요청 타입
 */
export interface UpdateProjectRequest {
  title?: string;
}

/**
 * 프로젝트 수정
 *
 * @param projectId - 수정할 프로젝트 ID
 * @param data - 수정할 데이터
 * @returns 수정된 프로젝트
 */
export async function updateProject(
  projectId: string,
  data: UpdateProjectRequest,
): Promise<Project> {
  const response = await apiClient.patch<Project>(`/projects/${projectId}`, data);
  return response.data;
}

/**
 * 프로젝트 생성
 *
 * @param projectId - 프로젝트 ID
 * @param data - 생성할 프로젝트 데이터
 * @returns 생성된 프로젝트
 */
export async function createProject(data: { title: string }): Promise<Project> {
  const response = await apiClient.post<Project>(`/projects`, data);
  return response.data;
}

/**
 * 프로젝트 삭제
 *
 * @param projectId - 삭제할 프로젝트 ID
 */
export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}`);
}
