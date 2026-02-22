import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import clsx from 'clsx';

import CommentCountIcon from '@/assets/icons/icon-comment-count.svg?react';
import MoreIcon from '@/assets/icons/icon-more.svg?react';
import ReactionCountIcon from '@/assets/icons/icon-reaction-count.svg?react';
import ViewCountIcon from '@/assets/icons/icon-view-count.svg?react';
import ThumbnailImage from '@/components/common/ThumbnailImage';
import { useRename } from '@/hooks/useRename';
import type { VideoPresentation } from '@/types/video';
import { formatRelativeTime } from '@/utils/format';

import { Dropdown } from '../common';
import type { DropdownItem } from '../common/Dropdown';
import { HighlightText } from '../common/HighlightText';
import ProcessingOverlay from '../common/ProcessingOverlay';
import RenamePresentationModal from './RenamePresentationModal';

type VideoPresentationCardProps = VideoPresentation & {
  highlightQuery?: string;
  isPresentationPending?: boolean;
  thumbnailVersion?: number;
  onDelete: () => void;
  onUpdateTitle: (newTitle: string) => Promise<void>;
  onDownload?: () => void;
};

export default function VideoPresentationCard({
  projectId,
  videoId,
  title,
  updatedAt,
  commentCount,
  reactionCount,
  viewCount,
  thumbnailUrl,
  status,
  highlightQuery = '',
  isPresentationPending = false,
  thumbnailVersion,
  onDelete,
  onUpdateTitle,
  onDownload,
}: VideoPresentationCardProps) {
  const navigate = useNavigate();

  const resolvedSrc = thumbnailUrl
    ? `${thumbnailUrl}${thumbnailUrl.includes('?') ? '&' : '?'}v=${thumbnailVersion}`
    : null;

  const isProcessing = isPresentationPending || status === 'uploading' || status === 'processing';

  const {
    isRenameModalOpen,
    isPending: isRenamePending,
    displayTitle,
    newTitle,
    setNewTitle,
    openRenameModal,
    closeRenameModal,
    confirmRename,
  } = useRename({
    initialTitle: title,
    onConfirmRename: onUpdateTitle,
    successMessage: '영상 이름을 변경했습니다.',
    errorMessage: '영상 이름을 변경하지 못했습니다.',
  });

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const isRenaming = isRenameModalOpen && isRenamePending;
  const isVideoDownloadable = status === 'ready';

  const handleCardClick = () => {
    if (isRenameModalOpen || isRenaming) return;
    if (isProcessing) return;

    navigate(`/${projectId}/videos/${videoId}`);
  };

  const dropdownItems: DropdownItem[] = [
    { id: 'rename', label: '이름 변경', onClick: openRenameModal },
    {
      id: 'download',
      label: '영상 다운로드',
      onClick: () => onDownload?.(),
      disabled: !onDownload || !isVideoDownloadable,
    },
    { id: 'delete', label: '삭제', variant: 'danger', onClick: onDelete },
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
              'md:mt-5 mt-2 flex flex-wrap items-center justify-end gap-x-1 gap-y-2 text-caption text-gray-600',
              isProcessing && 'invisible pointer-events-none',
            )}
            aria-hidden={isProcessing}
          >
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1">
                <CommentCountIcon className="w-4 h-4" />
                <span>{commentCount ?? 0}</span>

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
