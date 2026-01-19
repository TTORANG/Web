import clsx from 'clsx';

import CommentCountIcon from '@/assets/icons/icon-comment-count.svg?react';
import MoreIcon from '@/assets/icons/icon-more.svg?react';
import PageCountIcon from '@/assets/icons/icon-page-count.svg?react';
import ReactionCountIcon from '@/assets/icons/icon-reaction-count.svg?react';
import ViewCountIcon from '@/assets/icons/icon-view-count.svg?react';
import type { ProjectItem } from '@/types/project';

import { Popover } from '../common';

type ProjectCardProps = {
  item: ProjectItem;
  className?: string;
};

export default function ProjectCard({ item, className }: ProjectCardProps) {
  const {
    title,
    updatedAt,
    pageCount,
    commentCount,
    reactionCount,
    viewCount = 0,
    thumbnailUrl,
  } = item;

  return (
    <article className={clsx('overflow-hidden rounded-2xl border-none bg-white', className)}>
      <div className="w-full aspect-video bg-gray-200">
        {thumbnailUrl && (
          <img className="h-full w-full object-cover outline-none" src={thumbnailUrl} alt={title} />
        )}
      </div>

      <div className="p-4">
        {/* 제목 및 업데이트 날짜 */}
        <div className="flex justify-between items-center">
          <h3 className="text-body-m-bold text-gray-800">{title}</h3>
          <Popover
            trigger={({ isOpen }) => (
              <MoreIcon className={clsx(isOpen ? 'text-main' : 'text-gray-500')} />
            )}
            position="bottom"
            align="end"
            ariaLabel="더보기"
            className="border border-gray-200 w-32 overflow-hidden"
          >
            <div className="text-sm">
              <button className="w-full px-3 py-2 text-left hover:bg-gray-100" type="button">
                이름 변경
              </button>
              <button
                className="w-full px-3 py-2 text-left text-red-500 hover:bg-gray-100"
                type="button"
              >
                삭제
              </button>
            </div>
          </Popover>
        </div>
        <p className="mt-1 text-body-s text-gray-500">{updatedAt}</p>

        <div className="mt-5 flex items-center justify-between gap-3 text-caption text-gray-500">
          <div className="flex gap-1">
            <PageCountIcon />
            <span>{pageCount} 페이지</span>
          </div>

          {/* 반응 모음 */}
          <div className="flex gap-3">
            <div className="flex gap-1">
              <CommentCountIcon />
              <span>{commentCount}</span>
            </div>
            <div className="flex gap-1">
              <ReactionCountIcon />
              <span>{reactionCount}</span>
            </div>
            <div className="flex gap-1">
              <ViewCountIcon />
              <span>{viewCount}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
