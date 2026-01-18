import { type CSSProperties } from 'react';

import clsx from 'clsx';

/** 기본 스켈레톤 Props */
interface SkeletonBaseProps {
  /** 너비 (숫자면 px, 문자열이면 그대로) */
  width?: number | string;
  /** 높이 (숫자면 px, 문자열이면 그대로) */
  height?: number | string;
  /** 모서리 둥글기 (기본값: 4) */
  rounded?: number | string;
  /** 추가 클래스 */
  className?: string;
}

/** 원형 스켈레톤 Props */
interface SkeletonCircleProps {
  /** 원 크기 (기본값: 40) */
  size?: number;
  /** 추가 클래스 */
  className?: string;
}

/** 텍스트 스켈레톤 Props */
interface SkeletonTextProps {
  /** 줄 수 (기본값: 3) */
  lines?: number;
  /** 줄 높이 (기본값: 16) */
  lineHeight?: number;
  /** 줄 간격 (기본값: 8) */
  gap?: number;
  /** 마지막 줄 너비 비율 (기본값: 0.6) */
  lastLineWidth?: number;
  /** 추가 클래스 */
  className?: string;
}

const toSize = (value: number | string | undefined, fallback: number | string) =>
  value === undefined ? fallback : typeof value === 'number' ? `${value}px` : value;

/**
 * 기본 스켈레톤 블록
 * @example
 * <Skeleton width={200} height={20} />
 * <Skeleton width="100%" height={150} />
 */
function SkeletonBase({ width, height, rounded = 4, className = '' }: SkeletonBaseProps) {
  const style: CSSProperties = {
    width: toSize(width, '100%'),
    height: toSize(height, 16),
    borderRadius: toSize(rounded, 4),
  };

  return (
    <div
      className={clsx('animate-pulse bg-gray-200', className)}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * 원형 스켈레톤 (아바타, 프로필용)
 * @example
 * <Skeleton.Circle size={48} />
 */
function SkeletonCircle({ size = 40, className = '' }: SkeletonCircleProps) {
  return (
    <div
      className={clsx('animate-pulse rounded-full bg-gray-200', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

/**
 * 텍스트 여러 줄 스켈레톤
 * @example
 * <Skeleton.Text lines={3} />
 */
function SkeletonText({
  lines = 3,
  lineHeight = 16,
  gap = 8,
  lastLineWidth = 0.6,
  className = '',
}: SkeletonTextProps) {
  return (
    <div className={clsx('flex flex-col', className)} style={{ gap }} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-gray-200 rounded"
          style={{
            height: lineHeight,
            width: i === lines - 1 ? `${lastLineWidth * 100}%` : '100%',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// 프리셋 스켈레톤
// ============================================================

/**
 * 카드 스켈레톤 프리셋
 * @example
 * <Skeleton.Card />
 */
function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={clsx('rounded-xl border border-gray-200 bg-white p-4', className)}>
      {/* 썸네일 */}
      <SkeletonBase width="100%" height={120} rounded={8} className="mb-4" />
      {/* 제목 */}
      <SkeletonBase width="70%" height={20} className="mb-2" />
      {/* 설명 */}
      <SkeletonText lines={2} lineHeight={14} gap={6} />
    </div>
  );
}

/**
 * 리스트 아이템 스켈레톤 프리셋
 * @example
 * <Skeleton.ListItem />
 */
function SkeletonListItem({ className = '' }: { className?: string }) {
  return (
    <div className={clsx('flex items-center gap-3 py-3', className)}>
      {/* 아바타 */}
      <SkeletonCircle size={40} />
      {/* 텍스트 */}
      <div className="flex-1">
        <SkeletonBase width="40%" height={16} className="mb-2" />
        <SkeletonBase width="60%" height={12} />
      </div>
    </div>
  );
}

// Compound component 패턴
export const Skeleton = Object.assign(SkeletonBase, {
  Circle: SkeletonCircle,
  Text: SkeletonText,
  Card: SkeletonCard,
  ListItem: SkeletonListItem,
});
