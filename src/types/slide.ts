import type { GetScriptVersionHistoryResponseDto } from '@/api/dto';

import type { Comment } from './comment';
import type { Reaction } from './script';

/**
 * API 응답 타입: 슬라이드 목록 조회
 */
export interface SlideListItem {
  slideId: string;
  projectId: string;
  title: string;
  slideNum: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  /** 프론트엔드 확장용 - 대본 */
  script?: string;
  /** 프론트엔드 확장용 - 댓글 목록 */
  comments?: Comment[];
  /** 프론트엔드 확장용 - 수정 기록 */
  history?: GetScriptVersionHistoryResponseDto[];
  /** 프론트엔드 확장용 - 이모지 반응 */
  emojiReactions?: Reaction[];
  /** 영상 피드백에서 슬라이드 시작 시간 (초) */
  startTime?: number;
}
