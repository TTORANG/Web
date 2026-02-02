/**
 * @file share.ts
 * @description 공유 링크 관련 타입 정의
 */
import type { ApiResponse } from './api';

/** 공유 범위 타입 (API에서 사용하는 값) */
export type ShareScope = 'slides_script' | 'slides_script_video';

/** 1. 공유링크생성**/
/** 공유 링크 생성 요청 */
export interface CreateShareLinkRequest {
  scope: ShareScope;
  videoId?: string;
  expiredAt?: string;
}

/** 공유된 콘텐츠 요약 정보 */
export interface SharedContentSummary {
  scope: ShareScope;
  projectTitle: string;
  videoTitle?: string;
  videoCreatedAt?: string;
  thumbnailUrl?: string;
}

/** 공유 링크 생성 성공 데이터 */
export interface CreateShareLinkData {
  projectId: string;
  scope: ShareScope;
  shareToken: string;
  shareUrl: string;
  sharedContentSummary: SharedContentSummary;
  createdAt: string;
}

/** 공유 링크 생성 응답 */
export type CreateShareLinkResponse = ApiResponse<CreateShareLinkData>;

/** 4. 공유 가능 영상 목록 조회(무한스크롤) */
/** 공유 가능한 영상 아이템 */
export interface ShareableVideo {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

/** 공유 가능 영상 목록 페이지네이션 */
export interface ShareableVideosPagination {
  currentPage: number;
  totalCount: number;
  hasNext: boolean;
}

/** 공유 가능 영상 목록 데이터 */
export interface ShareableVideosData {
  videos: ShareableVideo[];
  pagination: ShareableVideosPagination;
}

/** 공유 가능 영상 목록 응답 */
export type ShareableVideosResponse = ApiResponse<ShareableVideosData>;
