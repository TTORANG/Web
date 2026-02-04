/**
 * 프레젠테이션 데이터 모델
 *
 * 프레젠테이션(발표) 하나의 정보를 나타냅니다.
 * 각 프레젠테이션은 페이지 수, 발표 시간, 댓글 및 이모지 반응 수, 조회수를 포함합니다.
 */

export interface CreatePresentationRequest {
  title: string;
  uploadFileId: string;
}

export interface CreatePresentationSuccess {
  message: string;
  projectId: string;
  title: string;
  createdAt: string;
}

export interface Presentation {
  id: string;
  title: string;
  userName: string;
  updatedAt: string;
  durationMinutes: number;
  pageCount: number;
  commentCount: number;
  reactionCount: number;
  viewCount: number;
  thumbnailUrl?: string;
}
