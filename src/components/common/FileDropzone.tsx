import { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';

import UploadIcon from '@/assets/icons/icon-upload.svg?react';
import type { UploadStep } from '@/types/uploadFile';
import { showToast } from '@/utils/toast';

import ProgressBar from './ProgressBar';

interface FileDropProps {
  onFileSelected: (file: File) => void;
  onCancelUpload: () => void;
  accept?: string;
  disabled?: boolean;
  currentStep?: UploadStep;
  progress?: number;
  error?: string | null;
}

export default function FileDropzone({
  onFileSelected = () => {},
  onCancelUpload = () => {},
  accept,
  disabled = false,
  currentStep = 'preparing',
  progress = 0,
  error,
}: FileDropProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  // dragCounter : 실제로 영역을 완전히 벗어났을 때만 카운터를 false로 바꿈
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const isUploading = currentStep === 'uploading' || currentStep === 'finishing';
  const isBlocked = disabled || isUploading; // 업로드 중에는 모든 입력 차단

  useEffect(() => {
    if (error) showToast.warning('업로드에 실패했어요.', error);
  }, [error]);

  /** 클릭으로 파일 선택 */
  const openFileDialog = () => {
    if (!isBlocked) {
      inputRef.current?.click();
    }
  };

  /** 파일 선택 */
  const handleFile = (fileList: FileList | null) => {
    if (!fileList || isBlocked) return;
    const file = fileList.item(0);
    if (!file) return;

    if (typeof onFileSelected != 'function') return;
    onFileSelected(file);

    if (inputRef.current) inputRef.current.value = ''; // 같은 파일 다시 선택 가능하게 (선택창 value 초기화)
  };

  const handleDragEnter = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBlocked) return;
    // 드래그가 영역 안에 있는 동안 지속적으로 true 유지
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBlocked) return;
  };

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBlocked) return;
    // 자식 요소 진입/이탈에서 발생하는 잦은 leave 이벤트로 하이라이트가 꺼지는 현상을 방지
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // 드롭 시 카운터 초기화해서 다음 드래그 상태가 꼬이지 않도록 함
    dragCounter.current = 0;
    setIsDragging(false);
    if (isBlocked) return;

    if (e.dataTransfer.files.length > 1) {
      showToast.warning('한 번에 하나의 파일만 업로드할 수 있습니다.');
    }
    // 첫번째 파일만 받아서 넘김
    const file = e.dataTransfer.files?.item(0);
    if (!file) return;

    if (typeof onFileSelected != 'function') return;
    onFileSelected(file);
  };

  /** 업로드 취소 */
  const handleCancelUploading = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onCancelUpload !== 'function') return;
    onCancelUpload();
  };

  const showDragOverlay = isDragging && !isBlocked;
  const showUploadOverlay = isUploading;

  return (
    <div className="w-full mt-10">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => handleFile(e.target.files)}
      />

      <button
        type="button"
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          'group relative w-full overflow-hidden rounded-2xl border bg-white px-8 py-14 shadow-sm transition focus:ring-1 focus:ring-gray-200',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-gray-100',
          showDragOverlay ? 'border-gray-900 ring-1 ring-gray-200' : 'border-gray-200',
        )}
      >
        {/* 드래그/업로드 중이면 블러/흐리게 */}
        <div
          className={clsx(
            'flex flex-col items-center gap-4 transition',
            (showDragOverlay || showUploadOverlay) && 'blur-sm opacity-40',
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 not-visited:transition group-hover:bg-gray-900">
            <UploadIcon className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-body-m-bold text-gray-900">
              발표 자료를 드래그하거나 클릭해 업로드하세요.
            </p>
            <p className="text-body-s text-gray-600">PDF, PPTX 파일을 지원합니다.</p>
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
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white px-6 cursor-default"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <p className="text-body-m-bold text-gray-900">업로드 중...</p>
            <div className="w-full">
              <ProgressBar value={progress} />
            </div>
            <button
              type="button"
              className="text-body-s-bold text-red-500"
              onClick={handleCancelUploading}
            >
              업로드 취소
            </button>
          </div>
        )}
      </button>
    </div>
  );
}
