import clsx from 'clsx';

type Props = {
  visible: boolean;
  variant?: 'card' | 'list';
  title?: string;
  description?: string;
  className?: string;
  blockPointerEvents?: boolean;
};

export default function ProcessingOverlay({
  visible,
  variant = 'card',
  title = '처리 중...',
  description = '잠시만 기다려주세요.',
  className,
  blockPointerEvents = true,
}: Props) {
  if (!visible) return null;

  const isCard = variant === 'card';
  const titleText = isCard ? title : '처리 중...';

  return (
    <div
      className={clsx(
        'absolute inset-0 z-20 flex items-center justify-center transition-all duration-250',
        blockPointerEvents ? 'pointer-events-auto' : 'pointer-events-none',
        'opacity-100',
        className,
      )}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.62)',
        backdropFilter: 'blur(4px)',
      }}
      aria-hidden={false}
    >
      <div className="text-center">
        <div
          className={clsx(
            'animate-spin border-4 border-gray-900 border-t-transparent rounded-full mx-auto',
            isCard ? 'h-10 w-10 mb-3' : 'h-8 w-8 mb-2',
          )}
        />
        <p className={clsx('font-bold text-gray-900', isCard ? 'text-sm' : 'text-xs')}>
          {titleText}
        </p>
        {isCard && <p className="mt-1 text-xs text-gray-900/80">{description}</p>}
      </div>
    </div>
  );
}
