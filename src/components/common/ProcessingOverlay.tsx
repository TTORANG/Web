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

  return (
    <div
      className={clsx(
        'absolute inset-0 z-20 bg-black/70 flex items-center justify-center',
        blockPointerEvents ? 'pointer-events-auto' : 'pointer-events-none',
        className,
      )}
    >
      <div className="text-center">
        <div
          className={clsx(
            'animate-spin border-4 border-t-transparent border-white rounded-full mx-auto',
            isCard ? 'h-10 w-10 mb-3' : 'h-8 w-8 mb-2',
          )}
        />
        <p className={clsx('text-white font-bold', isCard ? 'text-sm' : 'text-xs')}>{title}</p>
        <p className={clsx('text-white/80 mt-1', isCard ? 'text-xs' : 'text-[10px]')}>
          {description}
        </p>
      </div>
    </div>
  );
}
