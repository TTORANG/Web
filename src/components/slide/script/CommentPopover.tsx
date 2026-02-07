/**
 * @file CommentPopover.tsx
 * @description 의견 목록 팝오버
 *
 * 대본에 대한 팀원들의 의견을 보여주고, 답글을 달 수 있습니다.
 * useComments 훅을 통해 API와 동기화합니다.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';

import clsx from 'clsx';

import Comment from '@/components/comment/Comment';
import { CommentProvider } from '@/components/comment/CommentContext';
import { Popover, Skeleton } from '@/components/common';
import { useSlideActions, useSlideComments, useSlideId } from '@/hooks';
import { useSlideCommentsQuery } from '@/hooks/queries/useCommentQueries';
import { useComments } from '@/hooks/useComments';

interface CommentPopoverProps {
  isLoading?: boolean;
}

export default function CommentPopover({ isLoading }: CommentPopoverProps) {
  const slideId = useSlideId();
  const { setComments } = useSlideActions();
  const slideComments = useSlideComments();
  const { comments: treeComments, addReply, deleteComment, updateComment } = useComments();
  const { data: fetchedComments, isLoading: isCommentsLoading } = useSlideCommentsQuery(slideId);

  useEffect(() => {
    if (fetchedComments) {
      setComments(fetchedComments);
    }
  }, [fetchedComments, setComments]);

  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const submitReply = useCallback(
    (targetId: string) => {
      if (replyDraft.trim()) {
        addReply(targetId, replyDraft);
      }
      setReplyingToId(null);
      setReplyDraft('');
    },
    [replyDraft, addReply],
  );

  const toggleReply = useCallback((targetId: string) => {
    setReplyingToId((prev) => (prev === targetId ? null : targetId));
    setReplyDraft('');
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingToId(null);
    setReplyDraft('');
  }, []);

  const startEdit = useCallback((id: string, currentContent: string) => {
    setEditingId(id);
    setEditDraft(currentContent);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft('');
  }, []);

  const submitEdit = useCallback(
    (id: string) => {
      if (editDraft.trim()) {
        updateComment(id, editDraft.trim());
      }
      setEditingId(null);
      setEditDraft('');
    },
    [editDraft, updateComment],
  );

  const contextValue = useMemo(
    () => ({
      replyingToId,
      replyDraft,
      setReplyDraft,
      toggleReply,
      submitReply,
      cancelReply,
      deleteComment,
      editingId,
      editDraft,
      setEditDraft,
      startEdit,
      cancelEdit,
      submitEdit,
      goToRef: () => {}, // 슬라이드 페이지에서는 ref 이동 불필요
    }),
    [
      replyingToId,
      replyDraft,
      toggleReply,
      submitReply,
      cancelReply,
      deleteComment,
      editingId,
      editDraft,
      startEdit,
      cancelEdit,
      submitEdit,
    ],
  );

  return (
    <Popover
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
            {isLoading || isCommentsLoading ? (
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
      <CommentProvider value={contextValue}>
        <div className="h-80 overflow-y-auto">
          {treeComments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      </CommentProvider>
    </Popover>
  );
}
