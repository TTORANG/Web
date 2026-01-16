import type { UploadState } from './uploadFile';

export type ViewMode = 'card' | 'list';

export type SortMode = 'recent' | 'commentCount' | 'name';

export interface IntroSectionProps {
  accept: string;
  disabled: boolean;
  uploadState: UploadState;
  progress: number;
  error?: string | null;
  onFilesSelected: (files: File[]) => void;
  isEmpty: boolean;
}

export interface HomeStateProps {
  query: string;
  viewMode: ViewMode;
  sort: SortMode;
  setQuery: (query: string) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setSort: (sort: SortMode) => void;
}
