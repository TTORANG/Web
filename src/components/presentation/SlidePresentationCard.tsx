import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import clsx from 'clsx';

import CommentCountIcon from '@/assets/icons/icon-comment-count.svg?react';
import MoreIcon from '@/assets/icons/icon-more.svg?react';
import PageCountIcon from '@/assets/icons/icon-page-count.svg?react';
import ReactionCountIcon from '@/assets/icons/icon-reaction-count.svg?react';
import RecentIcon from '@/assets/icons/icon-recent.svg?react';
import ViewCountIcon from '@/assets/icons/icon-view-count.svg?react';
import ThumbnailImage from '@/components/common/ThumbnailImage';
import { getTabPath } from '@/constants/navigation';
import { usePresentationDeletion } from '@/hooks/usePresentationDeletion';
import { useRename } from '@/hooks/useRename';
import type { Presentation, PresentationStatus } from '@/types/presentation';
import { formatRelativeTime } from '@/utils/format';

import { Dropdown } from '../common';
import type { DropdownItem } from '../common/Dropdown';
import { HighlightText } from '../common/HighlightText';
import ProcessingOverlay from '../common/ProcessingOverlay';
import DeletePresentationModal from './DeletePresentationModal';
import RenamePresentationModal from './RenamePresentationModal';

type SlidePresentationCardProps = Presentation & {
  highlightQuery?: string;
  isPresentationPending?: boolean;
  thumbnailVersion?: number;
  onDelete?: () => void;
};

export default function SlidePresentationCard({
  projectId,
  title,
  highlightQuery = '',
  updatedAt,
  durationSeconds,
  slideCount,
  feedbackCount,
  thumbnailUrl,
  isPresentationPending = false,
  thumbnailVersion,
  onDelete,
  reactionCount,
  viewCount,
  status,
}: SlidePresentationCardProps) {
  const navigate = useNavigate();
  const { isDeleteModalOpen, openDeleteModal, closeDeleteModal, confirmDelete, isPending } =
    usePresentationDeletion(projectId);

  const resolvedSrc = thumbnailUrl
    ? `${thumbnailUrl}${thumbnailUrl.includes('?') ? '&' : '?'}v=${thumbnailVersion}`
    : null;

  const slideStatus: PresentationStatus = status;
  const isSlideProcessingStatus =
    slideStatus === 'queued' ||
    slideStatus === 'uploading' ||
    slideStatus === 'processing' ||
    slideStatus === 'partial_done';

  const isProcessing = isPresentationPending || (isSlideProcessingStatus && !thumbnailUrl);

  const minutes = durationSeconds > 0 ? Math.ceil(durationSeconds / 60) : null;

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

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const isRenaming = isRenameModalOpen && isRenamePending;

  const handleCardClick = () => {
    if (isRenameModalOpen || isRenaming || isDeleteModalOpen || isPending) return;
    if (isProcessing) return;

    navigate(getTabPath(projectId, 'slide'));
  };

  const dropdownItems: DropdownItem[] = [
    { id: 'rename', label: '이름 변경', onClick: openRenameModal },
    { id: 'delete', label: '삭제', variant: 'danger', onClick: onDelete || openDeleteModal },
  ];

  return (
    <>
      <article
        onClick={handleCardClick}
        className={clsx(
          'relative rounded-2xl border-none bg-white transition-all duration-250 ease-out',
          isMoreMenuOpen && 'z-[60]',
          isProcessing ? 'cursor-not-allowed' : 'cursor-pointer',
          !isProcessing && !isMoreMenuOpen && 'hover:-translate-y-0.5 hover:shadow-lg',
        )}
        aria-disabled={isProcessing}
      >
        <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-transparent">
          <ThumbnailImage
            key={`${projectId}-${thumbnailVersion ?? 0}`}
            src={resolvedSrc}
            alt={displayTitle}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-4">
          <div className="min-h-18 text-left">
            <div className="flex justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-body-m-bold text-gray-800 line-clamp-2">
                  <HighlightText
                    text={displayTitle}
                    query={highlightQuery}
                    highlightClassName="bg-transparent text-main"
                  />
                </h3>
                <p className="mt-1 text-body-s text-gray-600">{formatRelativeTime(updatedAt)}</p>
              </div>

              <div
                className="shrink-0 mt-1"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Dropdown
                  trigger={({ isOpen }) => (
                    <div className="p-2 -m-2" aria-label="더보기">
                      <MoreIcon className={clsx(isOpen ? 'text-main' : 'text-gray-600')} />
                    </div>
                  )}
                  ariaLabel="더보기"
                  items={dropdownItems}
                  position="bottom"
                  align="end"
                  onOpenChange={setIsMoreMenuOpen}
                />
              </div>
            </div>
          </div>

          <div
            className={clsx(
              'md:mt-5 mt-2 flex flex-wrap items-center justify-between gap-x-1 gap-y-2 text-caption text-gray-600',
              isProcessing && 'invisible pointer-events-none',
            )}
            aria-hidden={isProcessing}
          >
            <div className="flex items-center gap-2.5 shrink-0">
              {minutes !== null && (
                <div className="flex items-center">
                  <RecentIcon className="w-4 h-4" />
                  <span className="ml-1">{minutes}분</span>
                </div>
              )}
              <div className="flex items-center">
                <PageCountIcon className="w-4 h-4" />
                <span className="ml-1">{slideCount}장</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1">
                <CommentCountIcon className="w-4 h-4" />
                <span>{feedbackCount}</span>

                <div className="flex items-center gap-1">
                  <ReactionCountIcon className="w-4 h-4" />
                  <span>{reactionCount ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ViewCountIcon className="w-4 h-4" />
                  <span>{viewCount ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProcessingOverlay visible={isProcessing} variant="card" className="rounded-2xl" />
      </article>

      <div onClick={(e) => e.stopPropagation()}>
        {!onDelete && (
          <DeletePresentationModal
            isOpen={isDeleteModalOpen}
            presentationTitle={title}
            isPending={isPending}
            onClose={closeDeleteModal}
            onConfirm={confirmDelete}
          />
        )}

        <RenamePresentationModal
          isOpen={isRenameModalOpen}
          currentTitle={newTitle}
          isPending={isRenamePending}
          onClose={closeRenameModal}
          onConfirm={() => {
            void confirmRename();
          }}
          onTitleChange={setNewTitle}
        />
      </div>
    </>
  );
}
