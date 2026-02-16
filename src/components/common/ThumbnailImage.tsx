import { useCallback, useState } from 'react';

import clsx from 'clsx';

type Props = {
  src: string | null;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  decoding?: 'sync' | 'async' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
};

export default function ThumbnailImage({
  src,
  alt,
  className,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'low',
}: Props) {
  const [loadedSources, setLoadedSources] = useState<Record<string, true>>({});
  const [erroredSources, setErroredSources] = useState<Record<string, true>>({});
  const isLoaded = Boolean(src && loadedSources[src]);
  const hasError = Boolean(src && erroredSources[src]);

  const markLoaded = useCallback((loadedSrc: string) => {
    setLoadedSources((prev) => (prev[loadedSrc] ? prev : { ...prev, [loadedSrc]: true }));
  }, []);

  const markErrored = useCallback((erroredSrc: string) => {
    setErroredSources((prev) => (prev[erroredSrc] ? prev : { ...prev, [erroredSrc]: true }));
  }, []);

  const handleRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img || !src) return;
      if (img.complete && img.naturalWidth > 0) {
        markLoaded(src);
      }
    },
    [markLoaded, src],
  );

  const showSkeleton = !src || !isLoaded || hasError;
  const showImage = Boolean(src) && !hasError;

  return (
    <>
      {showSkeleton && <div className="h-full w-full bg-gray-200 animate-pulse" />}
      {showImage && (
        <img
          ref={handleRef}
          src={src!}
          alt={alt}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
          onLoad={() => markLoaded(src!)}
          onError={() => markErrored(src!)}
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
