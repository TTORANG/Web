/**
 * 프레젠테이션 데이터 모델
 *
 * 프레젠테이션(발표) 하나의 정보를 나타냅니다.
 * 각 프레젠테이션은 페이지 수, 발표 시간, 댓글 및 이모지 반응 수, 조회수를 포함합니다.
 */

export interface Presentation {
  projectId: string;
  title: string;
  status: PresentationStatus;
  thumbnailUrl?: string;
  slideCount: number;
  feedbackCount: number;
  reactionCount?: number;
  viewCount?: number;
  durationSeconds: number;
  userName?: string;
  createdAt: string;
  updatedAt: string;
}

export type PresentationStatus =
  | 'queued'
  | 'processing'
  | 'failed'
  | 'completed'
  | 'partial_done'
  | 'ready' // 아래 두개는 video 쪽
  | 'uploading';
/**
 * API 응답 타입: 프로젝트 생성 응답
 */
export interface PresentationCreateResponse {
  message: string;
  projectId: string;
  title: string;
  createdAt: string;
}

/**
 * API 응답 타입: 프로젝트 목록 조회 (페이지네이션)
 */
export interface PresentationListResponse {
  presentations: Presentation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * API 응답 타입: 프로젝트 수정 응답
 */
export interface UpdatePresentationResponse {
  projectId: string;
  title: string;
  userName: string;
  updatedAt: string;
}
