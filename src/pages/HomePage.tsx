import FileDropzone from '@/components/common/FileDropzone';
// import ProgressBar from '@/components/common/ProgressBar';
import { useUpload } from '@/hooks/useUpload';

const ACCEPTED_FILES_TYPES = '.pdf,.ppt,.pptx,.txt,.mp4';

export default function HomePage() {
  const { progress, state, error, uploadFiles, simulateUpload } = useUpload();
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-8">
      {/* 소개글 & 파일 업로드 */}
      <section className="flex flex-col items-center text-center">
        {/* 소개글 */}
        <div className="mt-10">
          <h1 className="text-body-l-bold text-gray-900">발표 연습을 시작하세요.</h1>
          <p className="mt-2 text-body-s text-gray-500">
            파일을 업로드해서 바로 연습을 시작해보세요.
          </p>
        </div>

        {/* Dropzone */}
        <FileDropzone
          disabled={state === 'uploading'}
          accept={ACCEPTED_FILES_TYPES}
          uploadState={state}
          progress={progress}
          // UI 확인용
          onFilesSelected={() => simulateUpload()}
          // 실제 업로드용
          // onFilesSelected={uploadFiles};
        />

        {error && <p className="mt-3 text-body-s text-red-500">업로드 실패: {error}</p>}
      </section>

      {/* 내발표 */}
      <section className="mt-14">
        {/* 제목 */}
        <div className="mb-4">
          <h2 className="text-body-m-bold">내 발표</h2>
        </div>

        {/* 검색 */}

        {/* 프레젠테이션 목록 */}
      </section>
    </main>
  );
}
