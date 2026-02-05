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
}: IntroSectionProps) {
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
        <p className="mt-2 text-body-s text-gray-400">
          파일을 업로드해서 바로 연습을 시작해보세요.
        </p>
      </div>

      {/* Dropzone */}
      <FileDropzone
        disabled={disabled}
        accept={accept}
        currentStep={currentStep}
        progress={progress}
        onFileSelected={onFileSelected}
        error={error}
        onCancelUpload={resetUpload}
      />

      {error && <p className="mt-3 text-body-s text-red-500">업로드 실패: {error}</p>}
    </section>
  );
}
