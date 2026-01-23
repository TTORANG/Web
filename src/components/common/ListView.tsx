import type { Key, ReactNode } from 'react';

import clsx from 'clsx';

export interface ListViewProps<T> {
  items: readonly T[];
  getKey: (item: T, index: number) => Key;
  renderLeading?: (item: T) => ReactNode;
  renderTrailing?: (item: T) => ReactNode;
  renderInfo: (item: T) => ReactNode;
  onItemClick?: (item: T) => void;
  className?: string;
  itemClassName?: string;
  empty?: ReactNode;
  ariaLabel?: string;
}

export function ListView<T>({
  items,
  getKey,
  renderLeading,
  renderTrailing,
  renderInfo,
  className,
  itemClassName,
  empty,
  ariaLabel,
}: ListViewProps<T>) {
  if (items.length === 0) {
    return <div className="listView__empty">{empty ?? 'No items'}</div>;
  }

  return (
    <div className={clsx('listView', className)} role="list" aria-label={ariaLabel}>
      {items.map((item, index) => {
        const key = getKey(item, index);

        return (
          <div key={key} className={clsx('listView__item', itemClassName)} role="listitem">
            {renderLeading && <div className="listView__leading">{renderLeading(item)}</div>}

            <div className="listView__content">{renderInfo(item)}</div>

            {renderTrailing && (
              <div className="listView__trailing ml-auto shrink-0">{renderTrailing(item)}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ListView;
