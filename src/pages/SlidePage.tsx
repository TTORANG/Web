import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { SlideList, SlideWorkspace } from '@/components/slide';
import { setLastSlideId } from '@/constants/navigation';
import { useSlides } from '@/hooks/queries/useSlides';
import { showToast } from '@/utils/toast';

export default function SlidePage() {
  const { projectId, slideId } = useParams<{
    projectId: string;
    slideId: string;
  }>();

  const { data: slides, isLoading, isError } = useSlides(projectId ?? '');

  /**
   * 슬라이드 로드 에러 처리
   */
  useEffect(() => {
    if (isError) {
      showToast.error('슬라이드를 불러오지 못했습니다.', '잠시 후 다시 시도해주세요.');
    }
  }, [isError]);

  /**
   * 탭 이동(영상/인사이트 → 슬라이드) 후 다시 돌아왔을 때
   * 마지막으로 보던 슬라이드로 복원하기 위함
   */
  useEffect(() => {
    if (projectId && slideId) {
      setLastSlideId(projectId, slideId);
    }
  }, [projectId, slideId]);

  const currentSlide = slides?.find((s) => s.id === slideId) ?? slides?.[0];
  const basePath = projectId ? `/${projectId}` : '';

  return (
    <div className="h-full bg-gray-100">
      <div className="flex h-full gap-12 pl-14 pr-20 pt-6">
        <SlideList
          slides={slides}
          currentSlideId={currentSlide?.id}
          basePath={basePath}
          isLoading={isLoading}
        />

        <main className="flex-1 h-full min-w-0 overflow-hidden">
          <SlideWorkspace slide={currentSlide} isLoading={isLoading} />
        </main>
      </div>
    </div>
  );
}
