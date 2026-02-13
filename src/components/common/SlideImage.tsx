/**
 * @file SlideImage.tsx
 * @description 슬라이드 이미지 공통 컴포넌트
 *
 * 이미지 로딩 상태를 관리하고 스켈레톤 UI를 제공합니다.
 * SlidePage와 FeedbackSlidePage에서 공통으로 사용됩니다.
 */
import { useCallback, useState } from 'react';

import clsx from 'clsx';

interface SlideImageProps {
  src: string;
  alt: string;
  maxHeight?: string;
  loading?: 'eager' | 'lazy';
  decoding?: 'sync' | 'async' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export default function SlideImage({
  src,
  alt,
  maxHeight,
  loading = 'eager',
  decoding = 'async',
  fetchPriority = 'high',
}: SlideImageProps) {
  const [loadedSources, setLoadedSources] = useState<Record<string, true>>({});
  const isLoaded = Boolean(loadedSources[src]);

  const markLoaded = useCallback((loadedSrc: string) => {
    setLoadedSources((prev) => (prev[loadedSrc] ? prev : { ...prev, [loadedSrc]: true }));
  }, []);

  const handleRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return;
      if (img.complete && img.naturalWidth > 0) {
        markLoaded(src);
      }
    },
    [markLoaded, src],
  );

  return (
    <img
      ref={handleRef}
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      onLoad={() => markLoaded(src)}
      style={maxHeight ? { maxHeight } : undefined}
      className={clsx(
        'block h-auto transition-opacity duration-300',
        maxHeight ? 'max-w-full' : 'w-full',
        !isLoaded && 'animate-pulse bg-gray-200',
        isLoaded ? 'opacity-100' : 'opacity-0',
      )}
    />
  );
}
