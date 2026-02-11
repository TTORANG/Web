import { useNavigate } from 'react-router-dom';

import clsx from 'clsx';

import CommentCountIcon from '@/assets/icons/icon-comment-count.svg?react';
import MoreIcon from '@/assets/icons/icon-more.svg?react';
import ReactionCountIcon from '@/assets/icons/icon-reaction-count.svg?react';
import RecentIcon from '@/assets/icons/icon-recent.svg?react';
import ViewCountIcon from '@/assets/icons/icon-view-count.svg?react';
import ThumbnailImage from '@/components/common/ThumbnailImage';
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
import RenamePresentationModal from './RenamePresentationModal';

type Props = (Presentation | VideoPresentation) & {
  highlightQuery?: string;
  mode?: 'slide' | 'videos';
  isThumbnailPending?: boolean;
  thumbnailVersion?: number;
  onDelete?: () => void;
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

// Using shared ThumbnailImage component from components/common

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
    isThumbnailPending,
    thumbnailVersion,
    onDelete,
  } = props;

  const navigate = useNavigate();
  const { isDeleteModalOpen, openDeleteModal, closeDeleteModal, confirmDelete, isPending } =
    usePresentationDeletion(projectId);

  const resolvedSrc =
    !isThumbnailPending && thumbnailUrl
      ? `${thumbnailUrl}${thumbnailUrl.includes('?') ? '&' : '?'}v=${thumbnailVersion}`
      : null;

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
  const totalCommentCount = isVideo ? (props as VideoPresentation).commentCount : feedbackCount;
  const reactionCount = isVideo ? (props as VideoPresentation).reactionCount : 0;
  const viewCount = isVideo ? (props as VideoPresentation).viewCount : 0;
  const isRenaming = isRenameModalOpen && isRenamePending;

  const handleCardClick = () => {
    if (isRenaming) return;

    if (mode === 'videos' && 'videoId' in props) {
      const videoId = (props as VideoPresentation).videoId;
      navigate(`/${projectId}/videos/${videoId}`);
    } else {
      navigate(getTabPath(projectId, mode));
    }
  };

  const handleDeleteClick = () => {
    // onDelete prop이 있으면 그것을 사용 (비디오 삭제)
    // 없으면 기본 프레젠테이션 삭제 모달 열기
    if (onDelete) {
      onDelete();
    } else {
      openDeleteModal();
    }
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
      onClick: handleDeleteClick,
    },
  ];

  return (
    <>
      <article
        onClick={handleCardClick}
        className="rounded-2xl border-none bg-white transition-shadow cursor-pointer hover:shadow-lg"
      >
        <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-transparent">
          <ThumbnailImage
            key={projectId}
            src={resolvedSrc}
            alt={displayTitle}
            pending={isThumbnailPending}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-4">
          <div className="min-h-18">
            <div className="flex justify-between gap-2">
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
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1">
                <RecentIcon className="w-4 h-4" />
                <span>{Math.ceil(durationSeconds / 60)}분</span>
                <span className="ml-1">{slideCount}페이지</span>
              </div>
            </div>

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

      {/* 프레젠테이션 삭제 모달 (onDelete가 없을 때만) */}
      {!onDelete && (
        <div onClick={(e) => e.stopPropagation()}>
          <DeletePresentationModal
            isOpen={isDeleteModalOpen}
            presentationTitle={title}
            isPending={isPending}
            onClose={closeDeleteModal}
            onConfirm={confirmDelete}
          />
        </div>
      )}

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

PresentationCard.Skeleton = PresentationCardSkeleton;

export default PresentationCard;
