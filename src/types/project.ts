import type { ViewMode } from './home';

export interface ProjectHeaderProps {
  value: string;
  onChange: (value: string) => void;
  viewMode: ViewMode;
  onChangeViewMode: (viewMode: ViewMode) => void;
}

// 프로젝트 전체의 코멘트 수, 리액션 수 => 슬라이드와 연결할 것..
export interface CardItems {
  id: string;
  title: string;
  updatedAt: string;
  pageCount: number;
  commentCount: number;
  reactionCount: number;
  viewCount: number;
  thumbnailUrl?: string;
}
