import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import clsx from 'clsx';

import CommentCountIcon from '@/assets/icons/icon-comment-count.svg?react';
import MoreIcon from '@/assets/icons/icon-more.svg?react';
import PageCountIcon from '@/assets/icons/icon-page-count.svg?react';
import ReactionCountIcon from '@/assets/icons/icon-reaction-count.svg?react';
import RecentIcon from '@/assets/icons/icon-recent.svg?react';
import ViewCountIcon from '@/assets/icons/icon-view-count.svg?react';
import { getTabPath } from '@/constants/navigation';
import { usePresentationDeletion } from '@/hooks/usePresentationDeletion';
import { useRename } from '@/hooks/useRename';
import type { Presentation } from '@/types/presentation';
import type { VideoPresentation } from '@/types/video';
import { formatRelativeTime } from '@/utils/format';

import { Skeleton } from '../common';
import { Dropdown, type DropdownItem } from '../common/Dropdown';
import DeletePresentationModal from './DeletePresentationModal';
import RenamePresentationModal from './RenamePresentationModal';

type Props = (Presentation | VideoPresentation) & {
  highlightQuery?: string;
  mode?: 'slide' | 'videos';
};

function PresentationListSkeleton() {
  return (
    <article className="flex w-full items-center justify-between bg-white px-5 py-4 rounded-2xl border border-gray-200">
      <div className="w-35 h-19.5 shrink-0 overflow-hidden rounded-lg bg-gray-200 animate-pulse" />

      <div className="flex flex-1 items-center justify-between pl-6">
        <div className="flex flex-col gap-0.5">
          <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />

          <div className="flex items-center gap-4 text-caption text-gray-600">
            <div className="flex items-center gap-4">
              <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
              <span className="flex items-center gap-1.5">
                <RecentIcon className="w-4 h-4" />
                <div className="h-3 w-8 rounded bg-gray-200 animate-pulse" />
              </span>
            </div>

            <span className="h-3.5 w-px bg-gray-200" />

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

        <div className="-m-2">
          <div className="p-2">
            <MoreIcon className="text-gray-600" />
          </div>
        </div>
      </div>
    </article>
  );
}

function PresentationList(props: Props) {
  const {
    projectId,
    title,
    updatedAt,
    durationSeconds,
    slideCount,
    feedbackCount,
    thumbnailUrl,
    mode = 'slide',
  } = props;

  const navigate = useNavigate();
  const [isThumbLoaded, setIsThumbLoaded] = useState(false);
  const { isDeleteModalOpen, openDeleteModal, closeDeleteModal, confirmDelete, isPending } =
    usePresentationDeletion(projectId);

  const {
    isRenameModalOpen,
    isPending: isRenamePending,
    displayTitle,
    newTitle,
    setNewTitle,
    openRenameModal,
    closeRenameModal,
    confirmRename,
  } = useRename({ projectId, initialTitle: title });

  const isVideo = 'reactionCount' in props && 'viewCount' in props;
  const commentCount = isVideo ? (props as VideoPresentation).commentCount : feedbackCount;
  const reactionCount = isVideo ? (props as VideoPresentation).reactionCount : 0;
  const viewCount = isVideo ? (props as VideoPresentation).viewCount : 0;

  const isRenaming = isRenameModalOpen && isRenamePending;

  const handleListClick = () => {
    if (isRenaming) return;
    navigate(getTabPath(projectId, 'slide'));
  };

  const dropdownItems: DropdownItem[] = [
    {
      id: 'rename',
      label: '이름 변경',
      onClick: openRenameModal,
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
        className="flex w-full items-center justify-between bg-white px-5 py-4 rounded-2xl border border-gray-200 transition-shadow cursor-pointer hover:shadow-lg"
      >
        {/* 썸네일 */}
        <div className="relative w-35 h-19.5 shrink-0 overflow-hidden rounded-lg bg-gray-200">
          {thumbnailUrl ? (
            <>
              {!isThumbLoaded && (
                <div className="absolute inset-0">
                  <Skeleton
                    width="100%"
                    height="100%"
                    rounded="12px"
                    className="bg-gray-200/70 animate-[pulse_3s_ease-in-out_infinite]"
                  />
                </div>
              )}
              <img
                className={clsx(
                  'h-full w-full object-cover transition-opacity',
                  isThumbLoaded ? 'opacity-100' : 'opacity-0',
                )}
                src={thumbnailUrl}
                alt={`${displayTitle}`}
                onLoad={() => setIsThumbLoaded(true)}
                onError={() => setIsThumbLoaded(false)}
              />
            </>
          ) : (
            <div className="absolute inset-0">
              <Skeleton
                width="100%"
                height="100%"
                rounded="12px"
                className="bg-gray-200/70 animate-[pulse_3s_ease-in-out_infinite]"
              />
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="flex flex-1 items-center justify-between pl-6">
          <div className="flex flex-col gap-0.5">
            {/* 제목 */}
            <div className="truncate text-body-m-bold text-gray-800">{displayTitle}</div>

            {/* 메타 정보 */}
            <div className="flex items-center gap-4 text-caption text-gray-600">
              {/* 날짜 & 소요 시간 */}
              <div className="flex items-center gap-4">
                <span>{formatRelativeTime(updatedAt)}</span>
                <span className="flex items-center gap-1.5">
                  <RecentIcon className="w-4 h-4" />
                  {Math.ceil(durationSeconds / 60)}분
                </span>
              </div>

              {/* 구분선 */}
              <span className="h-3.5 w-px bg-gray-200" />

              {/* 슬라이드 수 & 피드백 정보 */}
              <div className="flex items-center gap-4">
                {mode === 'slide' && (
                  <span className="flex items-center gap-1">
                    <PageCountIcon className="w-4 h-4" />
                    {slideCount} 슬라이드
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CommentCountIcon className="w-4 h-4" />
                  {commentCount ?? 0}
                </span>
                {isVideo && (
                  <>
                    <span className="flex items-center gap-1">
                      <ReactionCountIcon className="w-4 h-4" />
                      {reactionCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <ViewCountIcon className="w-4 h-4" />
                      {viewCount}
                    </span>
                  </>
                )}
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
        <DeletePresentationModal
          isOpen={isDeleteModalOpen}
          presentationTitle={displayTitle}
          isPending={isPending}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
        />
      </div>

      {/* 이름 변경 모달 */}
      <div onClick={(e) => e.stopPropagation()}>
        <RenamePresentationModal
          isOpen={isRenameModalOpen}
          currentTitle={newTitle}
          isPending={isRenamePending}
          onClose={closeRenameModal}
          onConfirm={confirmRename}
          onTitleChange={setNewTitle}
        />
      </div>
    </>
  );
}

PresentationList.Skeleton = PresentationListSkeleton;

export default PresentationList;
