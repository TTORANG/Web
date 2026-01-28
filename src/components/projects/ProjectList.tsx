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

function ProjectListSkeleton() {
  return (
    <article className="flex w-full items-center justify-between bg-white px-5 py-4 rounded-2xl border border-gray-200">
      {/* 썸네일 */}
      <div className="w-35 h-19.5 shrink-0 overflow-hidden rounded-lg bg-gray-200 animate-pulse" />

      {/* 본문 */}
      <div className="flex flex-1 items-center justify-between pl-6">
        <div className="flex flex-col gap-0.5">
          {/* 제목 스켈레톤 */}
          <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />

          {/* 메타 정보 */}
          <div className="flex items-center gap-4 text-caption text-gray-600">
            {/* 날짜 & 소요 시간 */}
            <div className="flex items-center gap-4">
              <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
              <span className="flex items-center gap-1.5">
                <RecentIcon className="w-4 h-4" />
                <div className="h-3 w-8 rounded bg-gray-200 animate-pulse" />
              </span>
            </div>

            {/* 구분선 */}
            <span className="h-3.5 w-px bg-gray-200" />

            {/* 페이지 수 & 반응 모음 */}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <PageCountIcon className="w-4 h-4" />
                <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
              </span>
              <span className="flex items-center gap-1">
                <CommentCountIcon className="w-4 h-4" />
                <div className="h-3 w-4 rounded bg-gray-200 animate-pulse" />
              </span>
              <span className="flex items-center gap-1">
                <ReactionCountIcon className="w-4 h-4" />
                <div className="h-3 w-4 rounded bg-gray-200 animate-pulse" />
              </span>
              <span className="flex items-center gap-1">
                <ViewCountIcon className="w-4 h-4" />
                <div className="h-3 w-4 rounded bg-gray-200 animate-pulse" />
              </span>
            </div>
          </div>
        </div>

        {/* 더보기 아이콘 - 그대로 유지 */}
        <div className="-m-2">
          <div className="p-2">
            <MoreIcon className="text-gray-600" />
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectList({
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
        className="flex w-full items-center justify-between cursor-pointer bg-white px-5 py-4 rounded-2xl border border-gray-200 transition-shadow hover:shadow-lg"
      >
        {/* 썸네일 */}
        <div className="w-35 h-19.5 shrink-0 overflow-hidden rounded-lg bg-gray-200">
          {thumbnailUrl && (
            <img className="h-full w-full object-cover" src={thumbnailUrl} alt={`${title}`} />
          )}
        </div>

        {/* 본문 */}
        <div className="flex flex-1 items-center justify-between pl-6">
          <div className="flex flex-col gap-0.5">
            {/* 제목 */}
            <div className="truncate text-body-m-bold text-gray-800">{title}</div>

            {/* 메타 정보 */}
            <div className="flex items-center gap-4 text-caption text-gray-600">
              {/* 날짜 & 소요 시간 */}
              <div className="flex items-center gap-4">
                <span>{formatRelativeTime(updatedAt)}</span>
                <span className="flex items-center gap-1.5">
                  <RecentIcon className="w-4 h-4" />
                  {durationMinutes}
                </span>
              </div>

              {/* 구분선 */}
              <span className="h-3.5 w-px bg-gray-200" />

              {/* 페이지 수 & 반응 모음 */}
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <PageCountIcon className="w-4 h-4" />
                  {pageCount} 페이지
                </span>
                <span className="flex items-center gap-1">
                  <CommentCountIcon className="w-4 h-4" />
                  {commentCount}
                </span>
                <span className="flex items-center gap-1">
                  <ReactionCountIcon className="w-4 h-4" />
                  {reactionCount}
                </span>
                <span className="flex items-center gap-1">
                  <ViewCountIcon className="w-4 h-4" />
                  {viewCount}
                </span>
              </div>
            </div>
          </div>

          {/* 더보기 */}
          <div onClick={(e) => e.stopPropagation()} className="-m-2">
            <Dropdown
              trigger={({ isOpen }) => (
                <div className="p-2">
                  <MoreIcon className={clsx(isOpen ? 'text-main' : 'text-gray-600')} />
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

ProjectList.Skeleton = ProjectListSkeleton;

export default ProjectList;
