import { useState } from 'react';

import clsx from 'clsx';

type Props = {
  src: string | null;
  alt: string;
  className?: string;
};

export default function ThumbnailImage({ src, alt, className }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const showSkeleton = !src || (src && !isLoaded) || hasError;
  const showImage = Boolean(src) && !hasError;

  return (
    <>
      {showSkeleton && <div className="h-full w-full bg-gray-200 animate-pulse" />}
      {showImage && (
        <img
          src={src!}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={clsx(
            className,
            'transition-opacity duration-500 ease-in-out',
            isLoaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </>
  );
}
