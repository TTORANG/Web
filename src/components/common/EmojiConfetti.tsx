/**
 * @file EmojiConfetti.tsx
 * @description 이모지 confetti 효과 컴포넌트
 */
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface EmojiConfettiProps {
  emoji: string;
  particleCount?: number;
  onComplete?: () => void;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 120,
    y: -40 - Math.random() * 60,
    rotation: (Math.random() - 0.5) * 60,
    scale: 0.6 + Math.random() * 0.6,
  }));
}

/**
 * 이모지 confetti 효과
 * key prop을 변경하여 트리거 (리마운트 패턴)
 *
 * @example
 * <EmojiConfetti key={triggerId} emoji="🔥" onComplete={handleComplete} />
 */
export default function EmojiConfetti({
  emoji,
  particleCount = 8,
  onComplete,
}: EmojiConfettiProps) {
  // 마운트 시 파티클 생성 (useState initializer)
  const [particles] = useState(() => generateParticles(particleCount));
  const [isVisible, setIsVisible] = useState(true);

  // 애니메이션 완료 후 정리
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute left-1/2 top-1/2 animate-confetti-burst"
          style={
            {
              '--tx': `${particle.x}px`,
              '--ty': `${particle.y}px`,
              '--r': `${particle.rotation}deg`,
              '--s': particle.scale,
              fontSize: '1.25rem',
            } as React.CSSProperties
          }
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}
