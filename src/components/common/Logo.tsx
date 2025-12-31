import logoFull from '@/assets/logo-full@4x.webp';
import logoIcon from '@/assets/logo-icon@4x.webp';

interface LogoProps {
  variant?: 'full' | 'icon';
}

export function Logo({ variant = 'full' }: LogoProps) {
  const src = variant === 'icon' ? logoIcon : logoFull;

  return <img src={src} alt="또랑" className="h-8" />;
}
