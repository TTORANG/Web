/**
 * @file share.ts
 * @description 공유 링크 관련 타입 정의
 */
import type { ApiResponse } from './api';

/** 공유 범위 타입(API에서 사용하는 값) */
export type ShareScope = 'slides_script' | 'slides_script_video';

/** 1. 공유링크 생성 */
export interface CreateShareLinkRequest {
  scope: ShareScope;
  videoId?: string;
  expiredAt?: string;
}

export interface SharedContentSummary {
  scope: ShareScope;
  projectTitle: string;
  videoTitle?: string;
  videoCreatedAt?: string;
  thumbnailUrl?: string;
}

export interface CreateShareLinkData {
  projectId: string;
  scope: ShareScope;
  shareToken: string;
  shareUrl: string;
  sharedContentSummary: SharedContentSummary;
  createdAt: string;
}

export type CreateShareLinkResponse = ApiResponse<CreateShareLinkData>;

/** 4. 공유 가능 영상 목록 조회 */
export interface ShareableVideo {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface ShareableVideosPagination {
  currentPage: number;
  totalCount: number;
  hasNext: boolean;
}

export interface ShareableVideosData {
  videos: ShareableVideo[];
  pagination: ShareableVideosPagination;
}

export type ShareableVideosResponse = ApiResponse<ShareableVideosData>;

/** 5. 공유 콘텐츠 조회 */
export interface SharedProjectSlide {
  slideId: string;
  slideNum: string | number;
  imageUrl: string;
  scriptText: string;
  timestampMs: number;
}

export interface SharedProjectVideo {
  videoId: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
}

export type SharedProjectCommentTargetType = 'video' | 'slide';

export interface SharedProjectComment {
  commentId: string;
  content: string;
  writer: string;
  targetType: SharedProjectCommentTargetType;
  targetId: string;
  timestampMs: number;
  createdAt: string;
  parentId: string | null;
}

export interface ReadSharedContentData {
  message: string;
  sessionInfo: {
    sessionId: string;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  shareInfo: {
    shareToken: string;
    scope: ShareScope;
    createdAt: string;
  };
  projectContent: {
    title: string;
    slides: SharedProjectSlide[];
    video: SharedProjectVideo | null;
    comments: SharedProjectComment[];
  };
}

export type ReadSharedContentResponse = ApiResponse<ReadSharedContentData>;
