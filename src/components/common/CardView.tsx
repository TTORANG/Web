/**
 * @file CardView.tsx
 * @description 제네릭 카드 그리드 뷰 컴포넌트
 */
import type { Key, ReactNode } from 'react';

import clsx from 'clsx';

export interface CardViewProps<T> {
  items: readonly T[];
  getKey: (item: T, index: number) => Key;
  renderCard: (item: T) => ReactNode;
  className?: string;
  itemClassName?: string;
  empty?: ReactNode;
  ariaLabal?: string;
}

export function CardView<T>({
  items,
  getKey,
  renderCard,
  className,
  itemClassName,
  empty,
  ariaLabal,
}: CardViewProps<T>) {
  if (items.length === 0) {
    // 부모에서 empty UI를 처리함
    if (empty === null) return null;

    // empty가 undefined면 기본 문구, 그 외면 전달된 empty 사용
    return <div className="cardView__empty">{empty === undefined ? 'No items' : empty}</div>;
  }

  return (
    <div className={clsx('cardView', className)} role="list" aria-label={ariaLabal}>
      {items.map((item, index) => (
        <div
          key={getKey(item, index)}
          className={clsx('cardView__item', itemClassName)}
          role="listitem"
        >
          {renderCard(item)}
        </div>
      ))}
    </div>
  );
}

export default CardView;
