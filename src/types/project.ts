export interface Project {
  id: string;
  title: string;
  updatedAt: string;
  pageCount: number;
  commentCount: number;
  reactionCount: number;
  viewCount: number;
  thumbnailUrl?: string;
}
