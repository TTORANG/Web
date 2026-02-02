/**
 * @file projects.ts
 * @description 프로젝트 관련 API 엔드포인트
 *
 * 서버와 통신하는 함수들을 정의합니다.
 * 이 함수들은 직접 호출하지 않고, hooks/queries에서 사용합니다.
 *
 * 위에 interface로 받는 타입 정의 해주고
 * 아래에서 endpoint 맞춰주고
 */
import type { Presentation } from '@/types/presentation';

import { apiClient } from '../client';

/**
 * 프로젝트 목록 조회
 *
 * 각 프로젝트는 id를 포함하며, 수정/삭제 시 이 id를 사용함.
 * @returns 프로젝트 배열
 */
export async function getPresentations(): Promise<Presentation[]> {
  const response = await apiClient.get<Presentation[]>(`/presentations`);
  return response.data;
}

/**
 * 프로젝트 상세 조회
 *
 * @param projectId - 프로젝트 ID
 */
export async function getPresentation(projectId: string): Promise<Presentation> {
  const response = await apiClient.get<Presentation>(`/presentations`);
  return response.data;
}

/**
 * 프로젝트 수정 요청 타입
 */
export interface UpdatePresentationRequest {
  title?: string;
}

/**
 * 프로젝트 수정
 *
 * @param projectId - 수정할 프로젝트 ID
 * @param data - 수정할 데이터
 * @returns 수정된 프로젝트
 */
export async function updatePresentation(
  projectId: string,
  data: UpdatePresentationRequest,
): Promise<Presentation> {
  const response = await apiClient.patch<Presentation>(`/presentations/${projectId}`, data);
  return response.data;
}

/**
 * 프로젝트 생성
 *
 * @param data - 생성할 프로젝트 데이터
 * @returns 생성된 프로젝트
 */
export async function createPresentation(data: { title: string }): Promise<Presentation> {
  const response = await apiClient.post<Presentation>(`/presentations`, data);
  return response.data;
}

/**
 * 프로젝트 삭제
 *
 * @param projectId - 삭제할 프로젝트 ID
 */
export async function deletePresentation(projectId: string): Promise<void> {
  await apiClient.delete(`/presentations/${projectId}`);
}
