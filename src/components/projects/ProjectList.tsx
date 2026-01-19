import clsx from 'clsx';

import CommentCountIcon from '@/assets/icons/icon-comment-count.svg?react';
import MoreIcon from '@/assets/icons/icon-more.svg?react';
import PageCountIcon from '@/assets/icons/icon-page-count.svg?react';
import ReactionCountIcon from '@/assets/icons/icon-reaction-count.svg?react';
import ViewCountIcon from '@/assets/icons/icon-view-count.svg?react';
import type { ProjectItem } from '@/types/project';

import { ListView, Popover } from '../common';

type ProjectListProps = {
  items: ProjectItem[];
  className?: string;
  itemClassName?: string;
  onDeleteClick?: (item: ProjectItem) => void; // 상위로 올릴 콜백 (플젝 삭제)
};

export default function ProjectList({
  items,
  className,
  itemClassName,
  onDeleteClick,
}: ProjectListProps) {
  return (
    <ListView
      items={items}
      getKey={(item) => item.id}
      className={clsx('flex flex-col gap-2', className)}
      itemClassName={clsx(
        'flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-3',
        itemClassName,
      )}
      // 프로젝트 슬라이드 이미지
      renderLeading={(item) => (
        <div className="h-18 w-32 overflow-hidden rounded-sm bg-gray-200">
          {item.thumbnailUrl && (
            <img className="h-full w-full object-cover" src={item.thumbnailUrl} alt={item.title} />
          )}
        </div>
      )}
      // 프로젝트 정보 (제목, 업데이트 날짜, 페이지 수, 반응 수)
      renderInfo={(item) => (
        <div className="min-w-0 flex-1">
          {/* 제목 */}
          <div className="truncate text-body-m-bold text-gray-900">{item.title}</div>

          {/* 날짜 | 페이지 수 + 댓글/이모티콘/조회 */}
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-gray-500">
            <div className="flex items-center gap-5">
              <span>{item.updatedAt}</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <PageCountIcon />
                {item.pageCount} 페이지
              </span>
            </div>

            <div className="flex items-center gap-3 text-caption text-gray-500">
              <span className="flex items-center gap-1">
                <CommentCountIcon />
                {item.commentCount}
              </span>
              <span className="flex items-center gap-1">
                <ReactionCountIcon />
                {item.reactionCount}
              </span>
              <span className="flex items-center gap-1">
                <ViewCountIcon />
                {item.viewCount}
              </span>
            </div>
          </div>
        </div>
      )}
      renderTrailing={(item) => (
        <Popover
          trigger={({ isOpen }) => (
            <button
              type="button"
              aria-label="더보기"
              className={clsx(isOpen ? 'text-main' : 'text-gray-500')}
            >
              <MoreIcon />
            </button>
          )}
          position="bottom"
          align="end"
          ariaLabel="더보기"
          className="border border-gray-200 w-32 overflow-hidden"
        >
          {({ close }) => (
            <div className="text-sm">
              <button className="w-full px-3 py-2 text-left hover:bg-gray-100" type="button">
                이름 변경
              </button>
              <button
                className="w-full px-3 py-2 text-left text-red-500 hover:bg-gray-100"
                type="button"
                onClick={() => {
                  close();
                  onDeleteClick?.(item);
                }}
              >
                삭제
              </button>
            </div>
          )}
        </Popover>
      )}
    />
  );
}
