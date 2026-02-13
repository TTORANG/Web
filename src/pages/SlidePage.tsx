import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { SlideList, SlideWorkspace } from '@/components/slide';
import { setLastSlideId } from '@/constants/navigation';
import { useSlides } from '@/hooks/queries/useSlides';
import { showToast } from '@/utils/toast';

export default function SlidePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: slides, isLoading, isError } = useSlides(projectId ?? '');

  const slideIdParam = searchParams.get('slideId');
  const currentSlide = slides?.find((s) => s.slideId === slideIdParam) ?? slides?.[0];
  const currentIndex = currentSlide
    ? (slides?.findIndex((s) => s.slideId === currentSlide.slideId) ?? -1)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = !!slides && currentIndex >= 0 && currentIndex < slides.length - 1;

  /**
   * 슬라이드 로드 에러 처리
   */
  useEffect(() => {
    if (isError) {
      showToast.error('슬라이드를 불러오지 못했습니다.', '새로고침 후 다시 시도해주세요.');
    }
  }, [isError]);

  /**
   * URL에 slideId가 없거나 유효하지 않은 경우, 첫 번째 슬라이드(또는 기본값)로 리다이렉트 (replace)
   */
  useEffect(() => {
    if (!isLoading && slides && slides.length > 0) {
      if (!slideIdParam) {
        // slideId가 아예 없으면 첫 번째 슬라이드로
        setSearchParams({ slideId: slides[0].slideId }, { replace: true });
      } else if (!slides.find((s) => s.slideId === slideIdParam)) {
        // slideId가 있지만 목록에 없으면 첫 번째 슬라이드로
        setSearchParams({ slideId: slides[0].slideId }, { replace: true });
      }
    }
  }, [isLoading, slides, slideIdParam, setSearchParams]);

  /**
   * 탭 이동(영상/인사이트 → 슬라이드) 후 다시 돌아왔을 때
   * 마지막으로 보던 슬라이드로 복원하기 위함
   */
  useEffect(() => {
    if (projectId && currentSlide?.slideId) {
      setLastSlideId(projectId, currentSlide.slideId);
    }
  }, [projectId, currentSlide?.slideId]);

  const goPrev = () => {
    if (!slides || !hasPrev) return;
    setSearchParams({ slideId: slides[currentIndex - 1].slideId }, { replace: true });
  };

  const goNext = () => {
    if (!slides || !hasNext) return;
    setSearchParams({ slideId: slides[currentIndex + 1].slideId }, { replace: true });
  };

  return (
    <div className="h-full bg-gray-100">
      <div
        role="tabpanel"
        id="tabpanel-slide"
        aria-labelledby="tab-slide"
        className="hidden min-[1024px]:flex h-full gap-12 pl-14 pr-20 pt-6"
      >
        <SlideList slides={slides} currentSlideId={currentSlide?.slideId} isLoading={isLoading} />

        <main className="flex-1 h-full min-w-0 overflow-hidden">
          <SlideWorkspace slide={currentSlide} isLoading={isLoading} />
        </main>
      </div>

      <div
        role="tabpanel"
        id="tabpanel-slide-mobile"
        aria-labelledby="tab-slide"
        className="flex min-[1024px]:hidden h-full flex-col px-4 py-4"
      >
        <div className="flex items-center justify-between pb-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={!hasPrev}
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="이전 슬라이드"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="m15 18-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span className="text-body-s-bold text-gray-800">
            {slides && currentIndex >= 0 ? `${currentIndex + 1} / ${slides.length}` : '- / -'}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={!hasNext}
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="다음 슬라이드"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="m9 6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <SlideWorkspace slide={currentSlide} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
