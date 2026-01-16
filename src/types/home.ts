import type { UploadState } from './uploadFile';

export interface IntroSectionProps {
  accept: string;
  disabled: boolean;
  uploadState: UploadState;
  progress: number;
  error?: string | null;
  onFilesSelected: (files: File[]) => void;
  isEmpty: boolean;
}
