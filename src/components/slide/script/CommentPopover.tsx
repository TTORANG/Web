/**
 * @file CommentPopover.tsx
 * @description 의견 목록 팝오버
 *
 * 대본에 대한 팀원들의 의견을 보여주고, 답글을 달 수 있습니다.
 * 무한 스크롤로 다음 페이지를 로드합니다.
 */
import { useCallback, useState } from 'react';

import clsx from 'clsx';

import CommentList from '@/components/comment/CommentList';
import { Popover, Skeleton } from '@/components/common';
import { useSlideComments, useSlideId } from '@/hooks';
import { useSlideCommentsInfiniteQuery } from '@/hooks/queries/useSlideCommentsQuery';
import { useSlideCommentsActions } from '@/hooks/useSlideCommentsActions';

interface CommentPopoverProps {
  isLoading?: boolean;
}

export default function CommentPopover({ isLoading }: CommentPopoverProps) {
  const slideId = useSlideId();
  const slideComments = useSlideComments();
  const {
    comments: treeComments,
    addReply,
    deleteComment,
    updateComment,
  } = useSlideCommentsActions();
  const {
    isLoading: isCommentsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSlideCommentsInfiniteQuery(slideId);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isDeleteModalOpen) return;
      setIsPopoverOpen(nextOpen);
    },
    [isDeleteModalOpen],
  );

  return (
    <Popover
      isOpen={isPopoverOpen}
      onOpenChange={handleOpenChange}
      trigger={({ isOpen }) => (
        <button
          type="button"
          aria-label={`의견 ${slideComments.length}개 보기`}
          className={clsx(
            'inline-flex h-7 items-center gap-1 rounded px-2',
            'outline-1 -outline-offset-1 focus-visible:outline-2 focus-visible:outline-main',
            isOpen
              ? 'bg-white outline-main'
              : 'bg-white outline-gray-200 hover:bg-gray-100 active:bg-gray-200',
          )}
        >
          <span
            className={clsx(
              'text-sm font-semibold leading-5',
              isOpen ? 'text-main' : 'text-gray-800',
            )}
          >
            의견
          </span>
          <span
            className={clsx(
              'min-w-3 text-center text-sm font-semibold leading-5',
              isOpen ? 'text-main-variant1' : 'text-gray-600',
            )}
          >
            {isLoading ? (
              <Skeleton width="100%" height={16} className="rounded" />
            ) : (
              slideComments.length
            )}
          </span>
        </button>
      )}
      position="top"
      align="end"
      ariaLabel="의견 목록"
      className="w-popover max-w-[90vw] overflow-hidden rounded-b-lg"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <span className="text-base font-semibold leading-6 text-gray-800">의견</span>
      </div>

      {/* 의견 목록 */}
      <div className="h-80 flex flex-col">
        <CommentList
          comments={treeComments}
          onAddReply={addReply}
          onGoToRef={() => {}}
          onDeleteComment={deleteComment}
          onUpdateComment={updateComment}
          isLoading={isLoading || isCommentsLoading}
          hasNextPage={Boolean(hasNextPage)}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => {
            void fetchNextPage();
          }}
          onDeleteModalOpenChange={setIsDeleteModalOpen}
        />
      </div>
    </Popover>
  );
}
