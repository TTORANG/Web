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
    return <div className="cardView__empty">{empty ?? 'No items'}</div>;
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
