import clsx from 'clsx';

import RemoveIcon from '@/assets/icons/icon-remove.svg?react';
import ReplyIcon from '@/assets/icons/icon-reply.svg?react';
import { formatRelativeTime } from '@/utils/format';

interface OpinionItemProps {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isReply?: boolean;
  isMine: boolean;
  isActive: boolean;
  onDelete: (id: string) => void;
  onReplyClick: (id: string) => void;
}

export default function OpinionItem({
  id,
  author,
  content,
  timestamp,
  isReply,
  isMine,
  isActive,
  onDelete,
  onReplyClick,
}: OpinionItemProps) {
  return (
    <div
      className={clsx(
        'flex gap-3 py-3 pr-4',
        isReply ? 'pl-15' : 'pl-4',
        isActive ? 'bg-gray-100' : 'bg-white',
      )}
    >
      {/* 프로필 이미지 */}
      <div className="w-8 shrink-0">
        <div className="h-8 w-8 rounded-full bg-gray-400" />
      </div>

      {/* 의견 내용 */}
      <div className="flex flex-1 flex-col gap-1 pt-1.5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="max-w-50 truncate text-sm font-semibold text-gray-800">
                {author}
              </span>
              <span className="text-xs font-medium text-gray-600">
                {formatRelativeTime(timestamp)}
              </span>
            </div>

            {isMine && (
              <button
                type="button"
                onClick={() => onDelete(id)}
                aria-label="의견 삭제"
                className="flex items-center gap-1 text-xs font-semibold text-error active:opacity-80"
              >
                삭제
                <RemoveIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <p className="text-sm font-medium text-gray-800">{content}</p>
        </div>

        {/* 답글 버튼 */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onReplyClick(id)}
            aria-expanded={isActive}
            aria-label={`${author}에게 답글 달기`}
            className={clsx(
              'flex items-center gap-1 text-xs font-semibold',
              isActive
                ? 'text-gray-400'
                : 'text-main hover:text-main-variant1 active:text-main-variant2',
            )}
          >
            답글
            <ReplyIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
