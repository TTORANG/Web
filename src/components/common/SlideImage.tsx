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
    <img
      src={src}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      className={clsx(
        'block w-full h-auto transition-opacity duration-300',
        !isLoaded && 'animate-pulse bg-gray-200',
        isLoaded ? 'opacity-100' : 'opacity-0',
      )}
    />
  );
}
