/**
 * @file SlideThumbnail.tsx
 * @description 개별 슬라이드 썸네일 아이템
 *
 * SlideList 내부에서 사용되며, 슬라이드 번호와 미리보기를 표시합니다.
 * 현재 선택된 슬라이드는 시각적으로 구분됩니다.
 */
import { Link } from 'react-router-dom';

import clsx from 'clsx';

import { SlideImage } from '@/components/common';
import type { Slide } from '@/types/slide';

interface SlideThumbnailProps {
  /** 슬라이드 데이터 */
  slide?: Slide;
  /** 슬라이드 순서 (0-indexed) */
  index: number;
  /** 현재 선택된 슬라이드 여부 */
  isActive?: boolean;
  /** 슬라이드 링크 기본 경로 */
  basePath?: string;
  /** 로딩 상태 (스켈레톤 표시) */
  isLoading?: boolean;
}

/**
 * 개별 슬라이드 썸네일
 *
 * 슬라이드 번호와 16:9 비율의 미리보기 이미지를 표시합니다.
 * isLoading 시 스켈레톤 UI를 렌더링합니다.
 */
export default function SlideThumbnail({
  slide,
  index,
  isActive = false,
  basePath = '',
  isLoading,
}: SlideThumbnailProps) {
  if (isLoading || !slide) {
    return (
      <div className="flex items-start gap-2 p-2">
        <span className="w-4" />
        <div className="flex-1 min-h-[100px] rounded bg-gray-200 animate-pulse" />
      </div>
    );
  }

  return (
    <Link
      to={{ search: `?slideId=${slide.id}` }}
      replace
      aria-current={isActive ? 'true' : undefined}
      className={clsx(
        'group flex items-start gap-2 p-2 rounded transition-colors focus-visible:outline-2 focus-visible:outline-main',
        isActive ? 'bg-main-variant1' : 'hover:bg-white',
      )}
    >
      {/* 번호 - 썸네일 왼쪽 */}
      <span
        className={clsx(
          'w-4 pt-1 text-right text-caption font-semibold select-none transition-colors',
          isActive ? 'text-white' : 'text-gray-800',
        )}
      >
        {index + 1}
      </span>

      {/* 썸네일 */}
      <div className="relative flex-1 rounded overflow-hidden bg-gray-200">
        <SlideImage src={slide.thumb} alt={`슬라이드 ${index + 1}: ${slide.title}`} />
      </div>
    </Link>
  );
}
