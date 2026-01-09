import { useRef, useState } from 'react';

import UploadIcon from '@/assets/icons/icon-upload.svg?react';

type FileDropProps = {
  onFilesSelected: (files: File[]) => void;
  accept?: string; // ex. ".pdf, .ppt, .pptx, .txt, .mp4"
  disabled?: boolean;
};

export default function FileDropzone({ onFilesSelected, accept, disabled }: FileDropProps) {
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

  return (
    <div className="w-full mt-10 max-w-3xl">
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
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={[
          'group w-full rounded-2xl border bg-white px-8 py-14 shadow-sm transition focus:ring-1 focus:ring-gray-200',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-gray-50',
          isDragging ? 'border-gray-900 ring-1 ring-gray-200' : 'border-gray-200',
        ].join(' ')}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700
                      transition group-hover:bg-gray-900"
          >
            <UploadIcon className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-body-m-bold text-gray-900">
              {isDragging ? '여기에 놓아서 업로드' : '파일을 드래그하거나 클릭하세요.'}
            </p>
            <p className="text-body-s text-gray-500">
              PDF, PPTX, TXT, MP4 등 모든 파일을 한번에 업로드하세요.
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
