/**
 * @file SlideImage.tsx
 * @description 슬라이드 이미지 공통 컴포넌트
 *
 * 이미지 로딩 상태를 관리하고 스켈레톤 UI를 제공합니다.
 * SlidePage와 FeedbackSlidePage에서 공통으로 사용됩니다.
 */
import { useState } from 'react';

import clsx from 'clsx';

interface SlideImageProps {
  src: string;
  alt: string;
}

export default function SlideImage({ src, alt }: SlideImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded && <div className="absolute inset-0 animate-pulse bg-black/10" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={clsx(
          'h-full w-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
        )}
      />
    </>
  );
}
