/**
 * @file shares.ts
 * @description 공유 링크 관련 API 엔드포인트 함수
 *
 * 서버와 통신하는 함수들을 정의합니다.
 * 각 함수는 hooks/queries 레이어에서 호출됩니다.
 */
import type {
  CreateShareLinkRequest,
  CreateShareLinkResponse,
  ReadSharedCommentsData,
  ReadSharedCommentsResponse,
  ReadSharedContentData,
  ReadSharedContentResponse,
  ShareableVideosResponse,
} from '@/types/share';

import { apiClient } from '../client';

/**
 * projectId에서 'p' 접두사를 제거합니다. (예: p4 -> 4)
 */
function normalizeProjectId(projectId: string): string {
  return projectId.startsWith('p') ? projectId.slice(1) : projectId;
}

/**
 * 공유 가능한 영상 목록 조회 (무한 스크롤)
 *
 * 공유 링크 생성 시 선택 가능한 '처리 완료(ready)' 상태의 영상 목록을 조회합니다.
 *
 * @param projectId - 프로젝트 ID (p4 또는 4)
 * @param page - 페이지 번호 (기본값 1)
 * @param pageSize - 페이지당 아이템 수 (기본값 10)
 * @returns 공유 가능한 영상 목록
 */
export async function getShareableVideos(
  projectId: string,
  page = 1,
  pageSize = 10,
): Promise<ShareableVideosResponse> {
  const normalizedId = normalizeProjectId(projectId);
  const response = await apiClient.get<ShareableVideosResponse>(
    `/presentations/${normalizedId}/shares/videos`,
    {
      params: { page, pageSize },
    },
  );
  return response.data;
}

/**
 * 공유 링크 생성
 *
 * 특정 프로젝트에 대해 공유 링크를 생성합니다.
 * 영상 포함 여부에 따라 scope를 설정합니다.
 *
 * @param projectId - 프로젝트 ID (p4 또는 4)
 * @param data - 공유 링크 생성 요청 데이터
 * @returns 생성된 공유 링크 정보
 */
export async function createShareLink(
  projectId: string,
  data: CreateShareLinkRequest,
): Promise<CreateShareLinkResponse> {
  const normalizedId = normalizeProjectId(projectId);
  const response = await apiClient.post<CreateShareLinkResponse>(
    `/presentations/${normalizedId}/shares`,
    data,
  );
  return response.data;
}

/**
 * 공유 토큰으로 공유 콘텐츠 조회
 *
 * @param shareToken - 공유 토큰

 * @param sessionId - 현재 로그인된 세션 ID (익명 세션 포함)
 * @returns 공유된 프로젝트 콘텐츠(슬라이드/영상)
 */
export async function getSharedContent(
  shareToken: string,
  sessionId?: string,
): Promise<ReadSharedContentData> {
  const response = await apiClient.get<ReadSharedContentResponse>(
    `/shares/${shareToken}${sessionId ? `?sessionId=${sessionId}` : ''}`,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}

/**
 * 공유 토큰으로 공유 댓글 목록 조회
 *
 * 외부 공유된 프로젝트의 댓글/답글 전체 목록을 조회합니다.
 * 조회수(viewCount) 및 페이지뷰를 증가시키지 않습니다.
 *
 * @param shareToken - 공유 토큰
 * @param sessionId - 현재 로그인된 세션 ID (isMine 계산에 필요)
 * @returns 공유 댓글 목록
 */
export async function getSharedComments(
  shareToken: string,
  sessionId?: string,
): Promise<ReadSharedCommentsData> {
  const response = await apiClient.get<ReadSharedCommentsResponse>(
    `/shares/${shareToken}/comments${sessionId ? `?sessionId=${sessionId}` : ''}`,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }
  throw new Error(response.data.error.reason);
}
