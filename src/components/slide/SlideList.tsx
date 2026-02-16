/**
 * @file SlideList.tsx
 * @description 슬라이드 썸네일 목록 (좌측 사이드바)
 *
 * 슬라이드 페이지 좌측에 위치하며, 전체 슬라이드를 썸네일로 보여줍니다.
 * 클릭 시 해당 슬라이드로 이동하며, 현재 선택된 슬라이드가 하이라이트됩니다.
 * 위/아래 화살표 키로 슬라이드 간 이동이 가능합니다.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getTabPath } from '@/constants/navigation';
import { useHotkey } from '@/hooks';
import type { SlideListItem } from '@/types/slide';

import SlideThumbnail from './SlideThumbnail';

const SKELETON_COUNT = 3;
const SCROLL_STORAGE_KEY_PREFIX = 'slideListScrollTop:';

interface SlideListProps {
  /** 슬라이드 목록 */
  slides?: SlideListItem[];
  /** 현재 선택된 슬라이드 ID */
  currentSlideId?: string;
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * 슬라이드 썸네일 목록 (좌측 사이드바)
 *
 * - 위/아래 화살표 키로 슬라이드 이동
 * - 현재 슬라이드 변경 시 자동 스크롤
 */
export default function SlideList({ slides, currentSlideId, isLoading }: SlideListProps) {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const scrollContainerRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const didHandleInitialActiveRef = useRef(false);
  const prevSlideIdRef = useRef<string | undefined>(undefined);

  const currentIndex = slides?.findIndex((slide) => slide.slideId === currentSlideId) ?? -1;

  const navigateToSlide = useCallback(
    (index: number) => {
      if (!slides || !projectId || index < 0 || index >= slides.length) return;
      navigate(getTabPath(projectId, 'slide', slides[index].slideId), { replace: true });
    },
    [navigate, projectId, slides],
  );

  const keyMap = useMemo(
    () => ({
      ArrowUp: () => navigateToSlide(currentIndex - 1),
      ArrowDown: () => navigateToSlide(currentIndex + 1),
    }),
    [currentIndex, navigateToSlide],
  );

  useHotkey(keyMap, { enabled: !isLoading && !!slides?.length });

  const saveScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !projectId) return;

    try {
      localStorage.setItem(`${SCROLL_STORAGE_KEY_PREFIX}${projectId}`, String(container.scrollTop));
    } catch {
      // localStorage 사용 불가 시 무시
    }
  }, [projectId]);

  /** 프로젝트 전환 시 자동 스크롤 상태 초기화 */
  useEffect(() => {
    didHandleInitialActiveRef.current = false;
    prevSlideIdRef.current = undefined;
  }, [projectId]);

  /** 목록 스크롤 복원 */
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (!projectId) {
      container.scrollTop = 0;
      return;
    }

    try {
      const raw = localStorage.getItem(`${SCROLL_STORAGE_KEY_PREFIX}${projectId}`);
      const nextScrollTop = raw === null ? 0 : Number(raw);
      container.scrollTop =
        Number.isFinite(nextScrollTop) && nextScrollTop >= 0 ? nextScrollTop : 0;
    } catch {
      container.scrollTop = 0;
    }
  }, [projectId]);

  /** 스크롤 중 현재 위치를 저장하고 언마운트 시 마지막 위치를 보존 */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !projectId) return;

    container.addEventListener('scroll', saveScrollPosition, { passive: true });

    return () => {
      container.removeEventListener('scroll', saveScrollPosition);
      saveScrollPosition();
    };
  }, [projectId, saveScrollPosition]);

  /** 초기 1회는 건너뛰고, 이후 현재 슬라이드 변경 시 해당 썸네일로 스크롤 */
  useEffect(() => {
    if (!listRef.current || currentIndex < 0 || !currentSlideId) return;

    if (!didHandleInitialActiveRef.current) {
      didHandleInitialActiveRef.current = true;
      prevSlideIdRef.current = currentSlideId;
      return;
    }

    if (prevSlideIdRef.current === currentSlideId) return;
    prevSlideIdRef.current = currentSlideId;

    const container = listRef.current;
    const activeItem = container.children[currentIndex] as HTMLElement | undefined;

    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentIndex, currentSlideId]);

  return (
    <aside
      ref={scrollContainerRef}
      className="w-60 shrink-0 h-full overflow-y-auto [scrollbar-gutter:stable]"
    >
      <div ref={listRef} className="flex flex-col gap-3 px-3 py-2">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SlideThumbnail key={i} index={i} isLoading />
            ))
          : slides?.map((slide, idx) => (
              <SlideThumbnail
                key={slide.slideId}
                slide={slide}
                index={idx}
                isActive={slide.slideId === currentSlideId}
              />
            ))}
      </div>
    </aside>
  );
}
