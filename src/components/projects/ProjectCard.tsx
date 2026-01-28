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

import { Dropdown } from '../common';
import type { DropdownItem } from '../common/Dropdown';
import DeleteProjectModal from './DeleteProjectModal';

export default function ProjectCard({
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

  const handleCardClick = () => {
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
        onClick={handleCardClick}
        className="cursor-pointer rounded-2xl border-none bg-white transition-shadow hover:shadow-lg"
      >
        <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-200">
          {thumbnailUrl && (
            <img
              className="h-full w-full object-contain outline-none"
              src={thumbnailUrl}
              alt={`${title}`}
            />
          )}
        </div>

        <div className="p-4">
          {/* 제목 및 업데이트 날짜 */}
          <div className="min-h-18">
            <div className="flex justify-between gap-2">
              <h3 className="text-body-m-bold text-gray-800 line-clamp-2">{title}</h3>
              {/* 더보기 */}
              <div onClick={(e) => e.stopPropagation()} className="shrink-0 mt-1">
                <Dropdown
                  trigger={({ isOpen }) => (
                    <div className="p-2 -m-2">
                      <MoreIcon className={clsx(isOpen ? 'text-main' : 'text-gray-400')} />
                    </div>
                  )}
                  items={dropdownItems}
                  position="bottom"
                  align="end"
                  ariaLabel="더보기"
                  menuClassName="w-32"
                />
              </div>
            </div>
            <p className="mt-1 text-body-s text-gray-400">{formatRelativeTime(updatedAt)}</p>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-1 gap-y-2 text-caption text-gray-600">
            {/* 왼쪽: 소요 시간, 페이지 수 */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1">
                <RecentIcon />
                <span>{durationMinutes}</span>
              </div>
              <div className="flex items-center gap-1">
                <PageCountIcon />
                <span>{pageCount} 페이지</span>
              </div>
            </div>

            {/* 오른쪽: 반응 모음 */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1">
                <CommentCountIcon />
                {commentCount}
              </div>
              <div className="flex items-center gap-1">
                <ReactionCountIcon />
                {reactionCount}
              </div>
              <div className="flex items-center gap-1">
                <ViewCountIcon />
                {viewCount}
              </div>
            </div>
          </div>
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
