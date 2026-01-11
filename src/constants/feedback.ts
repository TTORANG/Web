// constants/feedback.ts
import type { CommentItem } from '@/types/comment';
import type { Reaction, Slide } from '@/types/feedback';

export const INITIAL_SLIDES: Slide[] = Array.from({ length: 5 }, (_, i) => ({
  title: `슬라이드 ${i + 1}`,
  body: `슬라이드 ${i + 1} 내용입니다.`,
  viewerText: `Main Slide Content Area - ${i + 1}`,
}));

export const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: 'initial-1',
    author: '익명',
    timestamp: new Date(Date.now() - 1000 * 60).toISOString(), // 1분 전
    slideRef: '슬라이드 1',
    content: '이 부분 설명이 명확해요!',
    isMine: false,
    replies: [],
  },
  {
    id: 'initial-2',
    author: '익명',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4시간 전
    slideRef: '슬라이드 4',
    content: '여기 좋아요',
    isMine: false,
    replies: [],
  },
];

export const INITIAL_REACTIONS: Reaction[] = [
  { emoji: '🔥', label: '인상적이에요', count: 100, active: true },
  { emoji: '💤', label: '지루해요', count: 3, active: false },
  { emoji: '👍', label: '잘했어요', count: 1, active: false },
  { emoji: '👎', label: '별로예요', count: 0, active: false },
  { emoji: '🤷', label: '이해 안돼요', count: 0, active: false },
];
