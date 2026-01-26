import { useNavigate } from 'react-router-dom';

import clsx from 'clsx';

import CommentCountIcon from '@/assets/icons/icon-comment-count.svg?react';
import MoreIcon from '@/assets/icons/icon-more.svg?react';
import PageCountIcon from '@/assets/icons/icon-page-count.svg?react';
import ReactionCountIcon from '@/assets/icons/icon-reaction-count.svg?react';
import RecentIcon from '@/assets/icons/icon-recent.svg?react';
import ViewCountIcon from '@/assets/icons/icon-view-count.svg?react';
import { getTabPath } from '@/constants/navigation';
import { useProjectDeletion } from '@/hooks/useProjectDeletion';
import type { Project } from '@/types/project';
import { formatRelativeTime } from '@/utils/format';

import { Dropdown, type DropdownItem } from '../common/Dropdown';
import DeleteProjectModal from './DeleteProjectModal';

export default function ProjectList({
  id,
  title,
  updatedAt,
  durationMinutes,
  pageCount,
  commentCount,
  reactionCount,
  viewCount = 0,
  thumbnailUrl,
}: Project) {
  const navigate = useNavigate();
  const { isDeleteModalOpen, openDeleteModal, closeDeleteModal, confirmDelete, isPending } =
    useProjectDeletion(id);

  const handleListClick = () => {
    navigate(getTabPath(id, 'slide'));
  };

  const dropdownItems: DropdownItem[] = [
    {
      id: 'rename',
      label: '이름 변경',
      onClick: () => {
        // TODO: 이름 변경 로직 구현
      },
    },
    {
      id: 'delete',
      label: '삭제',
      variant: 'danger',
      onClick: openDeleteModal,
    },
  ];

  return (
    <>
      <article
        onClick={handleListClick}
        className="flex w-full items-center gap-4 cursor-pointer bg-white px-5 py-3 rounded-2xl border border-gray-200 transition-shadow hover:shadow-lg"
      >
        {/* 썸네일 */}
        <div className="h-16 aspect-video overflow-hidden rounded-sm bg-gray-200">
          {thumbnailUrl && (
            <img className="h-full w-full object-cover" src={thumbnailUrl} alt={`${title}`} />
          )}
        </div>

        {/* 본문 */}
        <div className="min-w-0 flex-1">
          {/* 제목 */}
          <div className="truncate text-body-m-bold text-gray-900">{title}</div>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-gray-500">
            <div className="flex items-center gap-4">
              {/* 날짜 */}
              <span>{formatRelativeTime(updatedAt)}</span>
              {/* 소요 시간 */}
              <span className="flex items-center gap-1">
                <RecentIcon />
                {durationMinutes}
              </span>

              <span className="text-gray-300">|</span>

              {/* 페이지 수 */}
              <span className="flex items-center gap-1">
                <PageCountIcon />
                {pageCount} 페이지
              </span>
            </div>

            {/* 반응 모음 */}
            <div className="flex items-center gap-3 text-caption text-gray-500">
              <span className="flex items-center gap-1">
                <CommentCountIcon />
                {commentCount}
              </span>
              <span className="flex items-center gap-1">
                <ReactionCountIcon />
                {reactionCount}
              </span>
              <span className="flex items-center gap-1">
                <ViewCountIcon />
                {viewCount}
              </span>
            </div>
          </div>
        </div>

        {/* 더보기 */}
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={({ isOpen }) => (
              <MoreIcon className={clsx(isOpen ? 'text-main' : 'text-gray-400')} />
            )}
            items={dropdownItems}
            position="bottom"
            align="end"
            ariaLabel="더보기"
            menuClassName="w-32"
          />
        </div>
      </article>

      {/* 삭제 확인 모달 */}
      <div onClick={(e) => e.stopPropagation()}>
        <DeleteProjectModal
          isOpen={isDeleteModalOpen}
          projectTitle={title}
          isPending={isPending}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
        />
      </div>
    </>
  );
}
