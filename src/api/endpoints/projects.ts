/**
 * @file projects.ts
 * @description 프로젝트 단건 조회 API
 */
import { apiClient } from '@/api';
import type { Project } from '@/types/project';

/**
 * 프로젝트 상세 조회
 *
 * @param projectId - 프로젝트 ID
 */
export async function getProject(projectId: string): Promise<Project> {
  const response = await apiClient.get<Project>(`/projects/${projectId}`);
  return response.data;
}
