import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import clsx from 'clsx';

import CommentCountIcon from '@/assets/icons/icon-comment-count.svg?react';
import MoreIcon from '@/assets/icons/icon-more.svg?react';
import ReactionCountIcon from '@/assets/icons/icon-reaction-count.svg?react';
import RecentIcon from '@/assets/icons/icon-recent.svg?react';
import ViewCountIcon from '@/assets/icons/icon-view-count.svg?react';
import { HighlightText } from '@/components/common/HighlightText';
import ThumbnailImage from '@/components/common/ThumbnailImage';
import { useIsDesktop } from '@/hooks';
import { useRename } from '@/hooks/useRename';
import type { VideoPresentation } from '@/types/video';
import { formatRelativeTime } from '@/utils/format';

import { Dropdown, type DropdownItem } from '../common/Dropdown';
import ProcessingOverlay from '../common/ProcessingOverlay';
import RenamePresentationModal from './RenamePresentationModal';

type VideoPresentationListProps = VideoPresentation & {
  highlightQuery?: string;
  isPresentationPending?: boolean;
  thumbnailVersion?: number;
  onDelete: () => void;
  onUpdateTitle: (newTitle: string) => Promise<void>;
  onDownload?: () => void;
  onOpen?: () => void;
};

export default function VideoPresentationList({
  projectId,
  videoId,
  title,
  updatedAt,
  durationSeconds,
  commentCount,
  reactionCount,
  viewCount,
  thumbnailUrl,
  status,
  isPresentationPending = false,
  thumbnailVersion,
  onDelete,
  onUpdateTitle,
  onDownload,
  onOpen,
  highlightQuery = '',
}: VideoPresentationListProps) {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  const resolvedSrc = thumbnailUrl
    ? `${thumbnailUrl}${thumbnailUrl.includes('?') ? '&' : '?'}v=${thumbnailVersion}`
    : null;

  const isProcessing = isPresentationPending || status === 'uploading' || status === 'processing';
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
  } = useRename({
    initialTitle: title,
    onConfirmRename: onUpdateTitle,
    successMessage: '영상 이름을 변경했습니다.',
    errorMessage: '영상 이름을 변경하지 못했습니다.',
  });

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const isVideoDownloadable = status === 'ready';
  const isRenaming = isRenameModalOpen && isRenamePending;

  const handleListClick = () => {
    if (isRenaming) return;
    if (isProcessing) return;

    if (onOpen) {
      onOpen();
      return;
    }

    navigate(`/${projectId}/videos/${videoId}`);
  };

  const dropdownItems: DropdownItem[] = [
    {
      id: 'rename',
      label: '이름 변경',
      onClick: openRenameModal,
    },
    {
      id: 'download',
      label: '영상 다운로드',
      onClick: () => onDownload?.(),
      disabled: !onDownload || !isVideoDownloadable,
    },
    {
      id: 'delete',
      label: '삭제',
      variant: 'danger',
      onClick: onDelete,
    },
  ];

  return (
    <>
      <article
        onClick={handleListClick}
        className={clsx(
          'relative flex w-full items-center justify-between bg-white px-5 py-4 rounded-2xl border border-gray-200 transition-all duration-250 ease-out',
          isMoreMenuOpen && 'z-[60]',
          isProcessing ? 'cursor-not-allowed' : 'cursor-pointer',
          !isProcessing && !isMoreMenuOpen && 'hover:-translate-y-0.5 hover:shadow-lg',
        )}
        aria-disabled={isProcessing}
      >
        <div className="relative w-35 h-19.5 shrink-0 overflow-hidden rounded-lg bg-transparent">
          <ThumbnailImage
            key={`${projectId}-${thumbnailVersion ?? 0}`}
            src={resolvedSrc}
            alt={displayTitle}
            className="h-full w-full object-cover"
          />
        </div>

        {isDesktop ? (
          <div className="flex flex-1 items-center justify-between pl-6 min-w-0">
            <div className="flex flex-1 flex-col gap-0.5 min-w-0">
              <div className="w-full text-body-m-bold text-gray-800 line-clamp-1">
                <HighlightText
                  text={displayTitle}
                  query={highlightQuery}
                  highlightClassName="bg-transparent text-main"
                />
              </div>

              <div className="flex gap-4">
                <div className="text-caption text-gray-600">{formatRelativeTime(updatedAt)}</div>

                <div
                  className={clsx(
                    'flex items-center gap-4 text-caption text-gray-600',
                    isProcessing && 'invisible pointer-events-none',
                  )}
                  aria-hidden={isProcessing}
                >
                  {minutes !== null && (
                    <span className="flex items-center gap-1.5">
                      <RecentIcon className="w-4 h-4" />
                      {minutes}분
                    </span>
                  )}

                  <span className="h-3.5 w-px bg-gray-200" />

                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <CommentCountIcon className="w-4 h-4" />
                      {commentCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <ReactionCountIcon className="w-4 h-4" />
                      {reactionCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <ViewCountIcon className="w-4 h-4" />
                      {viewCount ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div onClick={(e) => e.stopPropagation()} className="-m-2 shrink-0">
              <Dropdown
                trigger={({ isOpen }) => (
                  <div className="p-2" aria-label="더보기">
                    <MoreIcon className={clsx(isOpen ? 'text-main' : 'text-gray-600')} />
                  </div>
                )}
                items={dropdownItems}
                position="bottom"
                align="end"
                ariaLabel="더보기"
                menuClassName="w-32"
                onOpenChange={setIsMoreMenuOpen}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-1 flex-col gap-0.5 ml-2 min-w-0">
              <div className="w-full text-body-m-bold text-gray-800 line-clamp-1">
                <HighlightText
                  text={displayTitle}
                  query={highlightQuery}
                  highlightClassName="bg-transparent text-main"
                />
              </div>

              <div className="text-caption text-gray-600">{formatRelativeTime(updatedAt)}</div>

              <div
                className={clsx(
                  'flex flex-wrap items-center gap-2 text-caption text-gray-600',
                  isProcessing && 'invisible pointer-events-none',
                )}
                aria-hidden={isProcessing}
              >
                {minutes !== null && (
                  <span className="flex items-center gap-0.5">
                    <RecentIcon className="w-3 h-3" />
                    {minutes}분
                  </span>
                )}

                <span className="flex items-center gap-0.5">
                  <CommentCountIcon className="w-3 h-3" />
                  {commentCount ?? 0}
                </span>
              </div>
            </div>

            <div onClick={(e) => e.stopPropagation()} className="-m-2 shrink-0">
              <Dropdown
                trigger={({ isOpen }) => (
                  <div className="p-2" aria-label="더보기">
                    <MoreIcon className={clsx(isOpen ? 'text-main' : 'text-gray-600')} />
                  </div>
                )}
                items={dropdownItems}
                position="bottom"
                align="end"
                ariaLabel="더보기"
                menuClassName="w-32"
                onOpenChange={setIsMoreMenuOpen}
              />
            </div>
          </>
        )}

        <ProcessingOverlay visible={isProcessing} variant="list" className="rounded-2xl" />
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
