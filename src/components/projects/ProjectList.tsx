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
import { useRename } from '@/hooks/useRename';
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

  const {
    isRenaming,
    isUpdating,
    displayTitle,
    newTitle,
    setNewTitle,
    inputRef,
    startRenaming,
    handleSubmit,
    cancelRenaming,
  } = useRename({ projectId: id, initialTitle: title });

  const handleListClick = () => {
    if (isRenaming) return;
    navigate(getTabPath(id, 'slide'));
  };

  const dropdownItems: DropdownItem[] = [
    {
      id: 'rename',
      label: '이름 변경',
      onClick: startRenaming,
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
        className={clsx(
          'flex w-full items-center justify-between bg-white px-5 py-4 rounded-2xl border border-gray-200 transition-shadow',
          !isRenaming && 'cursor-pointer hover:shadow-lg',
        )}
      >
        {/* 썸네일 */}
        <div className="w-35 h-19.5 shrink-0 overflow-hidden rounded-lg bg-gray-200">
          {thumbnailUrl && (
            <img
              className="h-full w-full object-cover"
              src={thumbnailUrl}
              alt={`${displayTitle}`}
            />
          )}
        </div>

        {/* 본문 */}
        <div className="flex flex-1 items-center justify-between pl-6">
          <div className="flex flex-col gap-0.5">
            {/* 제목 */}
            {isRenaming ? (
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm max-w-md w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      cancelRenaming();
                    }
                  }}
                  disabled={isUpdating}
                  className={clsx(
                    'flex-1 min-w-0 text-body-m-bold text-gray-800',
                    'focus:outline-none',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'placeholder:text-gray-400',
                  )}
                  placeholder="발표 제목을 입력하세요"
                />
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={clsx(
                    'px-2 py-1 text-caption-bold text-white bg-main rounded-full shrink-0',
                    'hover:bg-blue-600 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                >
                  {isUpdating ? '저장 중...' : '저장'}
                </button>
              </form>
            ) : (
              <div className="truncate text-body-m-bold text-gray-800">{displayTitle}</div>
            )}

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
          {!isRenaming && (
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
          )}
        </div>
      </article>

      {/* 삭제 확인 모달 */}
      <div onClick={(e) => e.stopPropagation()}>
        <DeleteProjectModal
          isOpen={isDeleteModalOpen}
          projectTitle={displayTitle}
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
