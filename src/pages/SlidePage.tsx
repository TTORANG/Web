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

  return (
    <div className="h-full bg-gray-100">
      <div className="flex h-full gap-12 pl-14 pr-20 pt-6">
        <SlideList slides={slides} currentSlideId={currentSlide?.slideId} isLoading={isLoading} />

        <main className="flex-1 h-full min-w-0 overflow-hidden">
          <SlideWorkspace slide={currentSlide} isLoading={isLoading} />
        </main>
      </div>
    </div>
  );
}
