export type UploadState = 'idle' | 'uploading' | 'done' | 'error';

export interface FileDropProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  disabled?: boolean;
  uploadState?: UploadState;
  progress?: number; // 0~100
}
