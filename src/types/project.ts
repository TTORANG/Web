/**
 * 프로젝트 데이터 모델
 *
 * 프로젝트(발표) 하나의 정보를 나타냅니다.
 * 각 프로젝트는 페이지 수, 발표 시간, 댓글 및 이모지 반응 수, 조회수를 포함합니다.
 */

export interface Project {
  projectId: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  durationSeconds?: number;
  slideCount?: number;
  feedbackCount?: number;
  reactionCount?: number;
  viewCount: number; // TODO: 백엔드 반영
  thumbnailUrl?: string;
}
