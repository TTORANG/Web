import clsx from 'clsx';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  iconClassName?: string;
}

function isSafeAvatarSrc(src?: string | null): src is string {
  if (!src) return false;

  try {
    const parsed = new URL(src, window.location.origin);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function UserAvatar({
  src,
  alt = '프로필',
  size = 32,
  className,
  iconClassName,
}: UserAvatarProps) {
  if (isSafeAvatarSrc(src)) {
    return (
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={clsx('rounded-full object-cover', className)}
        style={{ backgroundColor: 'var(--color-gray-200)' }}
      />
    );
  }

  return (
    <div
      className={clsx('flex items-center justify-center rounded-full', className)}
      style={{ width: size, height: size, backgroundColor: 'var(--color-gray-200)' }}
    >
      <svg
        width={Math.max(16, Math.round(size * 0.5))}
        height={Math.max(16, Math.round(size * 0.5))}
        viewBox="0 0 24 24"
        fill="none"
        className={clsx('text-gray-600', iconClassName)}
      >
        <path
          d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
