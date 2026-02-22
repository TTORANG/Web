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
import type { VideoPresentation } from '@/types/video';
import { formatRelativeTime } from '@/utils/format';

import { Dropdown } from '../common';
import type { DropdownItem } from '../common/Dropdown';
import { HighlightText } from '../common/HighlightText';
import ProcessingOverlay from '../common/ProcessingOverlay';
import DeletePresentationModal from './DeletePresentationModal';
import RenamePresentationModal from './RenamePresentationModal';

type Props = (Presentation | VideoPresentation) & {
  highlightQuery?: string;
  mode?: 'slide' | 'videos';
  isPresentationPending?: boolean;
  thumbnailVersion?: number;
  onDelete?: () => void;
  onDownload?: () => void;
};

type SlideCardProps = Presentation &
  Omit<Props, keyof Presentation | 'mode'> & {
    mode?: 'slide';
    onUpdateTitle?: undefined;
    onDownload?: undefined;
  };

type VideoCardProps = VideoPresentation &
  Omit<Props, keyof VideoPresentation | 'mode'> & {
    mode: 'videos';
    onUpdateTitle: (newTitle: string) => Promise<void>;
    onDownload?: () => void;
  };

type CardProps = SlideCardProps | VideoCardProps;

const isVideoPresentation = (p: Presentation | VideoPresentation): p is VideoPresentation =>
  'videoId' in p;

function PresentationCardSkeleton() {
  return (
    <article className="rounded-2xl border-none bg-white">
      <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-200 animate-pulse" />
      <div className="p-4">
        <div className="min-h-18">
          <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
          <div className="mt-1 h-4 w-16 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </article>
  );
}

function PresentationCard(props: CardProps) {
  const {
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
    onDownload,
  } = props;
  const mode = props.mode ?? 'slide';

  const navigate = useNavigate();
  const { isDeleteModalOpen, openDeleteModal, closeDeleteModal, confirmDelete, isPending } =
    usePresentationDeletion(projectId);

  const resolvedSrc = thumbnailUrl
    ? `${thumbnailUrl}${thumbnailUrl.includes('?') ? '&' : '?'}v=${thumbnailVersion}`
    : null;

  const status: PresentationStatus = props.status;
  const isSlideProcessingStatus =
    status === 'queued' ||
    status === 'uploading' ||
    status === 'processing' ||
    status === 'partial_done';

  const isProcessing = (() => {
    if (isVideoPresentation(props)) {
      // video status: 'uploading' | 'processing' | 'ready' | 'failed'
      return isPresentationPending || props.status === 'uploading' || props.status === 'processing';
    }

    if (isPresentationPending) return true;

    // 홈(슬라이드)에서는 진행 상태이면서 썸네일이 없을 때만 처리 중 오버레이를 표시합니다.
    return isSlideProcessingStatus && !thumbnailUrl;
  })();

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
  } = useRename(
    props.mode === 'videos'
      ? {
          initialTitle: title,
          onConfirmRename: props.onUpdateTitle,
          successMessage: '영상 이름을 변경했습니다.',
          errorMessage: '영상 이름을 변경하지 못했습니다.',
        }
      : { projectId, initialTitle: title },
  );

  const isVideo = 'reactionCount' in props && 'viewCount' in props;
  const totalCommentCount = isVideo ? (props as VideoPresentation).commentCount : feedbackCount;
  const reactionCount = isVideo ? (props as VideoPresentation).reactionCount : 0;
  const viewCount = isVideo ? (props as VideoPresentation).viewCount : 0;
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const isRenaming = isRenameModalOpen && isRenamePending;
  const isVideoDownloadable =
    mode === 'videos' && isVideoPresentation(props) && props.status === 'ready';

  const handleCardClick = () => {
    // 모달이 열려있으면 이동 안함
    if (isRenameModalOpen || isRenaming || isDeleteModalOpen || isPending) return;
    if (isProcessing) return;

    if (mode === 'videos' && 'videoId' in props) {
      navigate(`/${projectId}/videos/${(props as VideoPresentation).videoId}`);
    } else {
      navigate(getTabPath(projectId, mode));
    }
  };

  const dropdownItems: DropdownItem[] = [
    { id: 'rename', label: '이름 변경', onClick: openRenameModal },
    ...(mode === 'videos'
      ? [
          {
            id: 'download',
            label: '영상 다운로드',
            onClick: () => onDownload?.(),
            disabled: !onDownload || !isVideoDownloadable,
          } satisfies DropdownItem,
        ]
      : []),
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
                {/* 제목 */}
                <h3 className="text-body-m-bold text-gray-800 line-clamp-2">
                  <HighlightText
                    text={displayTitle}
                    query={highlightQuery}
                    highlightClassName="bg-transparent text-main"
                  />
                </h3>
                {/* 업데이트된 시간 */}
                <p className="mt-1 text-body-s text-gray-600">{formatRelativeTime(updatedAt)}</p>
              </div>

              {/* 더보기 */}
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
            {/* 왼쪽 영역: 비디오가 '아닐 때만' 시간과 페이지 수를 보여줌 */}
            <div className="flex items-center gap-2.5 shrink-0">
              {mode === 'slide' && (
                <>
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
                </>
              )}
            </div>

            {/* 오른쪽 영역: 댓글(공통), 반응/조회수(비디오 전용) */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1">
                <CommentCountIcon className="w-4 h-4" />
                <span>{totalCommentCount ?? 0}</span>

                <div className="flex items-center gap-1">
                  <ReactionCountIcon className="w-4 h-4" />
                  <span>{reactionCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ViewCountIcon className="w-4 h-4" />
                  <span>{viewCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProcessingOverlay visible={isProcessing} variant="card" className="rounded-2xl" />
      </article>

      {/* 모달 전파 차단 */}
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

PresentationCard.Skeleton = PresentationCardSkeleton;
export default PresentationCard;
