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
import type { Presentation } from '@/types/presentation';
import type { VideoPresentation } from '@/types/video';
import { formatRelativeTime } from '@/utils/format';

import { Dropdown, type DropdownItem } from '../common/Dropdown';
import ProcessingOverlay from '../common/ProcessingOverlay';
import DeletePresentationModal from './DeletePresentationModal';
import RenamePresentationModal from './RenamePresentationModal';

type Props = (Presentation | VideoPresentation) & {
  highlightQuery?: string;
  mode?: 'slide' | 'videos';
  isPresentationPending?: boolean;
  thumbnailVersion?: number;
  onDelete?: () => void;
  // 비디오 전용 제목 수정 함수 추가
  onUpdateTitle?: (newTitle: string) => Promise<void>;
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
    isPresentationPending,
    thumbnailVersion,
    onDelete,
    onUpdateTitle,
  } = props;

  const navigate = useNavigate();
  const { isDeleteModalOpen, openDeleteModal, closeDeleteModal, confirmDelete, isPending } =
    usePresentationDeletion(projectId);

  const resolvedSrc = thumbnailUrl
    ? `${thumbnailUrl}${thumbnailUrl.includes('?') ? '&' : '?'}v=${thumbnailVersion}`
    : null;
  const isProcessing =
    isPresentationPending ||
    props.status === 'queued' ||
    props.status === 'processing' ||
    props.status === 'partial_done';
  const minutes = durationSeconds > 0 ? Math.ceil(durationSeconds / 60) : null;

  const {
    isRenameModalOpen,
    isPending: isRenamePending,
    displayTitle,
    newTitle,
    setNewTitle,
    openRenameModal,
    closeRenameModal,
    confirmRename: originalConfirmRename,
  } = useRename({ projectId, initialTitle: title });

  const isVideo = 'reactionCount' in props && 'viewCount' in props;
  const commentCount = isVideo ? (props as VideoPresentation).commentCount : feedbackCount;
  const reactionCount = isVideo ? (props as VideoPresentation).reactionCount : 0;
  const viewCount = isVideo ? (props as VideoPresentation).viewCount : 0;

  const isRenaming = isRenameModalOpen && isRenamePending;

  // 이름 변경 확인 핸들러 (비디오 모드 분기 처리)
  const handleConfirmRename = async () => {
    if (mode === 'videos' && onUpdateTitle) {
      try {
        await onUpdateTitle(newTitle);
        closeRenameModal();
      } catch (error) {
        console.error('Rename failed:', error);
      }
    } else {
      await originalConfirmRename();
    }
  };

  const handleListClick = () => {
    if (isRenaming) return;
    if (isProcessing) return;

    if (mode === 'videos' && 'videoId' in props) {
      const videoId = (props as VideoPresentation).videoId;
      navigate(`/${projectId}/videos/${videoId}`);
    } else {
      navigate(getTabPath(projectId, mode));
    }
  };

  const handleDeleteClick = () => {
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
        onClick={handleListClick}
        className={clsx(
          'relative flex w-full items-center justify-between bg-white px-5 py-4 rounded-2xl border border-gray-200 transition-all duration-250 ease-out',
          isProcessing
            ? 'cursor-not-allowed'
            : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg',
        )}
        aria-disabled={isProcessing}
      >
        {/* 썸네일 */}
        <div className="relative w-35 h-19.5 shrink-0 overflow-hidden rounded-lg bg-transparent">
          <ThumbnailImage
            key={`${projectId}-${thumbnailVersion ?? 0}`}
            src={resolvedSrc}
            alt={displayTitle}
            className="h-full w-full object-cover"
          />
        </div>

        {/* 본문 */}
        <div className="flex flex-1 items-center justify-between pl-6 min-w-0">
          <div className="flex flex-1 flex-col gap-0.5 min-w-0">
            {/* 제목 */}
            <div className="w-full text-body-m-bold text-gray-800 line-clamp-1">{displayTitle}</div>

            <div className="flex gap-4">
              {/* 날짜 */}
              <div className="text-caption text-gray-600">{formatRelativeTime(updatedAt)}</div>

              {/* 메타 정보 */}
              <div
                className={clsx(
                  'flex items-center gap-4 text-caption text-gray-600',
                  isProcessing && 'invisible pointer-events-none',
                )}
                aria-hidden={isProcessing}
              >
                {/* 소요 시간 */}
                {minutes !== null && (
                  <span className="flex items-center gap-1.5">
                    <RecentIcon className="w-4 h-4" />
                    {minutes}분
                  </span>
                )}

                {/* 구분선 */}
                <span className="h-3.5 w-px bg-gray-200" />

                {/* 슬라이드 수 & 피드백 정보 */}
                <div className="flex items-center gap-4">
                  {mode === 'slide' && (
                    <span className="flex items-center gap-1">
                      <PageCountIcon className="w-4 h-4" />
                      {slideCount} 장
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
          </div>

          {/* 더보기 */}
          <div onClick={(e) => e.stopPropagation()} className="-m-2 shrink-0">
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

        <ProcessingOverlay visible={isProcessing} variant="list" className="rounded-2xl" />
      </article>

      {/* 프레젠테이션 삭제 모달 (onDelete가 없을 때만) */}
      {!onDelete && (
        <div onClick={(e) => e.stopPropagation()}>
          <DeletePresentationModal
            isOpen={isDeleteModalOpen}
            presentationTitle={displayTitle}
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
          onConfirm={handleConfirmRename} // 래핑된 핸들러로 교체
          onTitleChange={setNewTitle}
        />
      </div>
    </>
  );
}

PresentationList.Skeleton = PresentationListSkeleton;

export default PresentationList;
