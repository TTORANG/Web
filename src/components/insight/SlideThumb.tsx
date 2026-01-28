interface SlideThumbProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export default function SlideThumb({
  src,
  alt,
  className = 'w-16 h-10',
  fallbackClassName = 'w-16 h-10 bg-gray-200 rounded',
}: SlideThumbProps) {
  if (!src) {
    return <div className={fallbackClassName} aria-hidden="true" />;
  }

  return <img src={src} alt={alt} className={className} />;
}
