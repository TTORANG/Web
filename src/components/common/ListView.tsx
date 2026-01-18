import type { Key, ReactNode } from 'react';

import clsx from 'clsx';

export interface ListViewProps<T> {
  items: readonly T[];
  getKey: (item: T, index: number) => Key;
  renderTitle: (item: T) => ReactNode;
  renderUpdatedAt?: (item: T) => ReactNode;
  renderMeta?: (item: T) => ReactNode;
  renderLeading?: (item: T) => ReactNode;
  renderTrailing?: (item: T) => ReactNode;
  renderStats?: (item: T) => ReactNode;
  onItemClick?: (item: T) => void;
  className?: string;
  itemClassName?: string;
  empty?: ReactNode;
  ariaLabel?: string;
}

export function ListView<T>({
  items,
  getKey,
  renderTitle,
  renderUpdatedAt,
  renderMeta,
  renderLeading,
  renderTrailing,
  renderStats,
  onItemClick,
  className,
  itemClassName,
  empty,
  ariaLabel,
}: ListViewProps<T>) {
  if (items.length === 0) {
    return <div className="listView__empty">{empty ?? 'No items'}</div>;
  }

  const isClickable = Boolean(onItemClick);

  return (
    <div className={clsx('listView', className)} role="list" aria-label={ariaLabel}>
      {items.map((item, index) => {
        const key = getKey(item, index);

        return (
          <div
            key={key}
            className={clsx('listView__item', itemClassName, isClickable && 'is-clickable')}
            role="listitem"
            tabIndex={isClickable ? 0 : undefined}
            onClick={isClickable ? () => onItemClick?.(item) : undefined}
            onKeyDown={
              isClickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onItemClick?.(item);
                    }
                  }
                : undefined
            }
          >
            {renderLeading && <div className="listView__leading">{renderLeading(item)}</div>}

            <div className="listView__content">
              <div className="listView__title">{renderTitle(item)}</div>

              {(renderUpdatedAt || renderMeta) && (
                <div className="listView__meta">
                  {renderUpdatedAt && (
                    <span className="listView__updated">{renderUpdatedAt(item)}</span>
                  )}
                  {renderMeta && <span className="listView__metaExtra">{renderMeta(item)}</span>}
                </div>
              )}

              {renderStats && <div className="listView__stats">{renderStats(item)}</div>}
            </div>

            {renderTrailing && <div className="listView__trailing">{renderTrailing(item)}</div>}
          </div>
        );
      })}
    </div>
  );
}

export default ListView;
