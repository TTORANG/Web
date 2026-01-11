import { useRef, useState } from 'react';

import UploadIcon from '@/assets/icons/icon-upload.svg?react';
import type { FileDropProps } from '@/types/uploadFile';

import ProgressBar from './ProgressBar';

export default function FileDropzone({
  onFilesSelected,
  accept,
  disabled,
  uploadState = 'idle',
  progress = 0,
}: FileDropProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openFileDialog = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || disabled) return;
    const files = Array.from(fileList);
    if (files.length === 0) return;
    onFilesSelected(files);
  };

  const handleDragEnterOrOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const showDragOverlay = isDragging && !disabled;
  const showUploadOverlay = uploadState === 'uploading';

  return (
    <div className="w-full mt-10">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        type="button"
        onClick={openFileDialog}
        disabled={disabled}
        onDragEnter={handleDragEnterOrOver}
        onDragOver={handleDragEnterOrOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          'group relative w-full overflow-hidden rounded-2xl border bg-white px-8 py-14 shadow-sm transition focus:ring-1 focus:ring-gray-200',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-gray-50',
          showDragOverlay ? 'border-gray-900 ring-1 ring-gray-200' : 'border-gray-200',
        ].join(' ')}
      >
        {/* 드래그/업로드 중이면 블러/흐리게 */}
        <div
          className={[
            'flex flex-col items-center gap-4 transition',
            showDragOverlay || showUploadOverlay ? 'blur-sm opacity-40' : '',
          ].join(' ')}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700
                      transition group-hover:bg-gray-900"
          >
            <UploadIcon className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-body-m-bold text-gray-900">파일을 드래그하거나 클릭하세요.</p>
            <p className="text-body-s text-gray-500">
              PDF, PPTX, TXT, MP4 등 모든 파일을 한번에 업로드하세요.
            </p>
          </div>
        </div>

        {/* 드래그 오버레이 : 박스 블러 + 중앙 문구만 */}
        {showDragOverlay && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
            <div className="rounded-xl bg-white/70 px-6 py-3 backdrop-blur-md">
              <p className="text-body-m-bold text-gray-900">여기에 놓아서 업로드</p>
            </div>
          </div>
        )}

        {/* 업로드 오버레이 : 박스 안에 진행률 표시 */}
        {showUploadOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white/60 backdrop-blur-sm px-6">
            <p className="text-body-m-bold text-gray-900">업로드 중...</p>
            <div className="w-full">
              <ProgressBar value={progress} />
            </div>
          </div>
        )}
      </button>
    </div>
  );
}
