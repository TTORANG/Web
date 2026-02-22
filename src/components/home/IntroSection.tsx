import clsx from 'clsx';

import type { UploadStep } from '@/types/uploadFile';

import FileDropzone from '../common/FileDropzone';

interface IntroSectionProps {
  accept: string;
  resetUpload: () => void;
  disabled: boolean;
  currentStep: UploadStep;
  progress: number;
  error?: string | null;
  onFileSelected: (file: File) => void;
  isEmpty: boolean;
  showDemoCtas?: boolean;
  onGoToDemoSlide?: () => void;
  onGoToDemoInsight?: () => void;
  onGoToDemoFeedback?: () => void;
}

export default function IntroSection({
  accept,
  resetUpload,
  disabled,
  currentStep,
  progress,
  error,
  onFileSelected,
  isEmpty,
  showDemoCtas = false,
  onGoToDemoSlide,
  onGoToDemoInsight,
  onGoToDemoFeedback,
}: IntroSectionProps) {
  const isUploading = currentStep === 'uploading' || currentStep === 'finishing';

  return (
    <section
      className={clsx(
        'flex flex-col items-center text-center',
        isEmpty ? 'min-h-[calc(100vh-3.75rem)] justify-center' : 'py-8',
      )}
    >
      {/* 소개글 */}
      <div className="mt-10">
        <h1 className="text-body-l-bold text-gray-900">발표 연습을 시작하세요.</h1>
        <p className="mt-2 text-body-s text-gray-700">
          파일을 업로드해서 바로 연습을 시작해보세요.
        </p>
      </div>

      {/* Dropzone */}
      <FileDropzone
        disabled={disabled && !isUploading}
        accept={accept}
        currentStep={currentStep}
        progress={progress}
        onFileSelected={onFileSelected}
        error={error}
        onCancelUpload={resetUpload}
      />

      {error && <p className="mt-3 text-body-s text-red-500">업로드 실패: {error}</p>}

      {showDemoCtas && (
        <div className="mt-8 w-full max-w-2xl rounded-2xl border border-gray-200 bg-white px-6 py-5">
          <p className="text-body-m-bold text-gray-900">업로드 없이 데모 먼저 둘러보기</p>
          <p className="mt-1 text-body-s text-gray-600">
            실제 화면과 동일한 슬라이드, 영상, 인사이트, 피드백 흐름을 바로 확인할 수 있어요.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onGoToDemoSlide}
              className="rounded-lg bg-main px-4 py-2 text-body-s-bold text-white hover:bg-main-variant2"
            >
              데모 슬라이드 보기
            </button>
            <button
              type="button"
              onClick={onGoToDemoInsight}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-body-s-bold text-gray-800 hover:bg-gray-100"
            >
              데모 인사이트 보기
            </button>
            <button
              type="button"
              onClick={onGoToDemoFeedback}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-body-s-bold text-gray-800 hover:bg-gray-100"
            >
              데모 피드백 보기
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
