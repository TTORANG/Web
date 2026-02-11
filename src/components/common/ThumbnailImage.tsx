import { useState } from 'react';

import clsx from 'clsx';

type Props = {
  src: string | null;
  alt: string;
  pending?: boolean;
  className?: string;
};

export default function ThumbnailImage({ src, alt, pending, className }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const showSkeleton = pending || (src && !isLoaded) || hasError;
  const showImage = src && !pending && !hasError;

  return (
    <>
      {showSkeleton && <div className="h-full w-full bg-gray-200 animate-pulse" />}
      {showImage && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={clsx(className, !isLoaded && 'hidden')}
        />
      )}
    </>
  );
}
