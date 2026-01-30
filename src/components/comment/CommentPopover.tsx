/**
 * @file CommentPopover.tsx
 * @description 슬라이드 의견 목록 팝오버
 *
 * 대본에 대한 팀원들의 의견을 보여주고, 답글을 달 수 있습니다.
 * Zustand store를 통해 의견 데이터를 읽고 업데이트합니다.
 */
import { useCallback, useMemo, useState } from 'react';

import clsx from 'clsx';

import { Popover } from '@/components/common';
import { useSlideActions, useSlideOpinions } from '@/hooks';

import Comment from './Comment';
import { CommentProvider } from './CommentContext';

export default function CommentPopover() {
  const opinions = useSlideOpinions();
  const { deleteOpinion, addReply } = useSlideActions();
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');

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

  const contextValue = useMemo(
    () => ({
      replyingToId,
      replyDraft,
      setReplyDraft,
      toggleReply,
      submitReply,
      cancelReply,
      deleteComment: deleteOpinion,
      goToRef: () => {}, // 슬라이드 페이지에서는 ref 이동 불필요
    }),
    [replyingToId, replyDraft, toggleReply, submitReply, cancelReply, deleteOpinion],
  );

  return (
    <Popover
      trigger={({ isOpen }) => (
        <button
          type="button"
          aria-label={`의견 ${opinions.length}개 보기`}
          className={clsx(
            'inline-flex h-7 items-center gap-1 rounded px-2',
            'outline-1 -outline-offset-1',
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
              'text-sm font-semibold leading-5',
              isOpen ? 'text-main-variant1' : 'text-gray-600',
            )}
          >
            {opinions.length}
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
          {opinions.map((opinion) => (
            <Comment key={opinion.id} comment={opinion} isIndented={opinion.isReply} />
          ))}
        </div>
      </CommentProvider>
    </Popover>
  );
}
