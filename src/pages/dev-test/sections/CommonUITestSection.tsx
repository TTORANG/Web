import { ActionButton, ProgressBar, SlideImage } from '@/components/common';
import { showToast } from '@/utils/toast';

export function CommonUITestSection() {
  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-gray-800">🧩 Common UI Components</h2>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* ActionButton */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">ActionButton</h3>
          <div className="space-y-2">
            <ActionButton text="기본 버튼" onClick={() => showToast.info('버튼 클릭됨')} />
            <ActionButton text="비활성화 버튼" onClick={() => {}} disabled />
          </div>
        </div>
      </div>

      {/* SlideImage */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-600">
          SlideImage (With Loading & Skeleton)
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="aspect-video relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            <SlideImage src="/thumbnails/slide-0.webp" alt="Slide 1" />
          </div>
          <div className="aspect-video relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            <SlideImage src="/thumbnails/slide-1.webp" alt="Slide 2" />
          </div>
          <div className="aspect-video relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            {/* 잘못된 URL로 스켈레톤/에러 확인용 (SlideImage 구현에 따라 다름) */}
            <SlideImage src="/invalid-path.jpg" alt="Invalid" />
          </div>
        </div>
      </div>
    </section>
  );
}
