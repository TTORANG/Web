import UploadIcon from '@/assets/icons/icon-upload.svg?react';

export default function HomePage() {
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
        <div className="w-full mt-10 max-w-3xl">
          {/* 전체가 클릭되는 버튼 */}
          <button
            type="button"
            className="group w-full rounded-2xl border border-gray-200 bg-white px-6 py-10 cursor-pointer
                    shadow-sm transition hover:bg-gray-50 focus:ring-2 focus:ring-gray-200"
            onClick={() => {
              // TODO : 여기에 input[type=file] 연결해야 함
            }}
          >
            <div className="flex flex-col items-center gap-4">
              {/* 아이콘 */}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700
                              transition group-hover:bg-gray-900"
              >
                <UploadIcon className="h-5 w-5 text-white" />
              </div>

              <div className="space-y-1">
                <p className="text-body-m-bold text-gray-900">파일을 드래그하거나 클릭하세요.</p>
                <p className="text-body-s text-gray-500">
                  PDF, PPTX, TXT, MP4 등 모든 파일을 한번에 업로드하세요.
                </p>
              </div>
            </div>
          </button>
        </div>
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
