import type { GetScriptVersionHistoryResponseDto } from '@/api/dto';

import type { Comment } from './comment';
import type { Reaction } from './script';

/**
 * API 응답 타입: 슬라이드 목록 조회
 */
export interface SlideListItem {
  script: string;
  slideId: string;
  projectId: string;
  title: string | null;
  slideNum: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  /** 영상 피드백에서 슬라이드 시작 시간 (초) */
  startTime?: number;
}

/**
 * 프론트엔드 확장 타입: 슬라이드 상세/편집 화면용
 */
export interface SlideDetail extends SlideListItem {
  /** 댓글 목록 */
  comments?: Comment[];
  /** 수정 기록 */
  history?: GetScriptVersionHistoryResponseDto[];
  /** 이모지 반응 */
  emojiReactions?: Reaction[];
}
