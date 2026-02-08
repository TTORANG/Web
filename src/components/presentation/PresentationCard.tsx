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

import { Dropdown } from '../common';
import type { DropdownItem } from '../common/Dropdown';
import { HighlightText } from '../common/HighlightText';
import DeletePresentationModal from './DeletePresentationModal';

type Props = (Presentation | VideoPresentation) & {
  highlightQuery?: string;
  mode?: 'slide' | 'videos';
};

function PresentationCardSkeleton() {
  return (
    <article className="rounded-2xl border-none bg-white">
      <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-200 animate-pulse" />

      <div className="p-4">
        <div className="min-h-18">
          <div className="flex justify-between gap-2">
            <div className="flex-1">
              <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="shrink-0 mt-1">
              <div className="p-2 -m-2">
                <MoreIcon className="text-gray-400" />
              </div>
            </div>
          </div>
          <div className="mt-1 h-4 w-16 rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="mt-5 flex items-center justify-between text-caption text-gray-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <RecentIcon />
              <div className="h-3 w-6 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <CommentCountIcon />
              <div className="h-3 w-3 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="flex items-center gap-1">
              <ReactionCountIcon />
              <div className="h-3 w-3 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="flex items-center gap-1">
              <ViewCountIcon />
              <div className="h-3 w-3 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function PresentationCard(props: Props) {
  const {
    projectId,
    title,
    highlightQuery = '',
    updatedAt,
    durationSeconds,
    slideCount,
    feedbackCount,
    thumbnailUrl,
    mode = 'slide',
    ...rest
  } = props;

  const navigate = useNavigate();
  const { isDeleteModalOpen, openDeleteModal, closeDeleteModal, confirmDelete, isPending } =
    usePresentationDeletion(projectId);

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
  } = useRename({ projectId, initialTitle: title });

  const isVideo = 'reactionCount' in rest && 'viewCount' in rest;
  const totalCommentCount = isVideo ? (rest as VideoPresentation).commentCount : feedbackCount;
  const reactionCount = isVideo ? (rest as VideoPresentation).reactionCount : 0;
  const viewCount = isVideo ? (rest as VideoPresentation).viewCount : 0;

  const handleCardClick = () => {
    if (isRenaming) return;
    navigate(getTabPath(projectId, mode));
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
        onClick={handleCardClick}
        className={clsx(
          'rounded-2xl border-none bg-white transition-shadow',
          !isRenaming && 'cursor-pointer hover:shadow-lg',
        )}
      >
        <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-200">
          {thumbnailUrl && (
            <img
              className="h-full w-full object-contain outline-none"
              src={thumbnailUrl}
              alt={`${displayTitle}`}
            />
          )}
        </div>

        <div className="p-4">
          <div className="min-h-18">
            <div className="flex justify-between gap-2">
              {isRenaming ? (
                <form
                  onSubmit={handleSubmit}
                  className="flex-1 flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm w-full max-w-full overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') cancelRenaming();
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
                <div className="flex-1 min-w-0">
                  <h3 className="text-body-m-bold text-gray-800 line-clamp-2">
                    <HighlightText
                      text={displayTitle}
                      query={highlightQuery}
                      highlightClassName="bg-transparent text-main"
                    />
                  </h3>
                  <p className="mt-1 text-body-s text-gray-400">{formatRelativeTime(updatedAt)}</p>
                </div>
              )}

              {!isRenaming && (
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
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-1 gap-y-2 text-caption text-gray-600">
            {/* 왼쪽: 소요 시간 */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1">
                <RecentIcon className="w-4 h-4" />
                <span>{Math.ceil(durationSeconds / 60)}분</span>
              </div>
            </div>

            {/* 오른쪽: 댓글, 리액션, 조회수 */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1">
                <CommentCountIcon className="w-4 h-4" />
                <span>{totalCommentCount ?? 0}</span>
              </div>

              {isVideo && (
                <>
                  <div className="flex items-center gap-1">
                    <ReactionCountIcon className="w-4 h-4" />
                    <span>{reactionCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ViewCountIcon className="w-4 h-4" />
                    <span>{viewCount}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </article>

      <div onClick={(e) => e.stopPropagation()}>
        <DeletePresentationModal
          isOpen={isDeleteModalOpen}
          presentationTitle={title}
          isPending={isPending}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
        />
      </div>
    </>
  );
}

PresentationCard.Skeleton = PresentationCardSkeleton;

export default PresentationCard;
