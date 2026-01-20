/**
 * @file Opinion.tsx
 * @description 의견 목록 팝오버
 *
 * 대본에 대한 팀원들의 의견을 보여주고, 답글을 달 수 있습니다.
 * useComments 훅을 통해 API와 동기화합니다.
 */
import { useState } from 'react';

import clsx from 'clsx';

import Comment from '@/components/comment/Comment';
import { Popover, Skeleton } from '@/components/common';
import { useSlideOpinions } from '@/hooks';
import { useComments } from '@/hooks/useComments';

interface CommentPopoverProps {
  isLoading?: boolean;
}

export default function CommentPopover({ isLoading }: CommentPopoverProps) {
  const opinions = useSlideOpinions();
  const { comments: treeOpinions, addReply, deleteComment } = useComments();

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  /**
   * 답글을 등록합니다.
   * @param parentId - 답글을 달 의견의 ID
   */
  const handleReplySubmit = (parentId: string) => {
    if (!replyText.trim()) return;
    addReply(parentId, replyText);
    setActiveReplyId(null);
    setReplyText('');
  };

  const handleToggleReply = (id: string) => {
    setActiveReplyId(activeReplyId === id ? null : id);
    setReplyText('');
  };

  const handleCancelReply = () => {
    setActiveReplyId(null);
    setReplyText('');
  };

  return (
    <Popover
      trigger={({ isOpen }) => (
        <button
          type="button"
          aria-label={`의견 ${opinions.length}개 보기`}
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
              opinions.length
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
      <div className="h-80 overflow-y-auto">
        {treeOpinions.map((opinion) => (
          <Comment
            key={opinion.id}
            comment={opinion}
            isActive={activeReplyId === opinion.id}
            replyText={replyText}
            onReplyTextChange={setReplyText}
            onToggleReply={() => handleToggleReply(opinion.id)}
            onSubmitReply={() => handleReplySubmit(opinion.id)}
            onCancelReply={handleCancelReply}
            onDelete={() => deleteComment(opinion.id)}
            onDeleteComment={deleteComment}
            replyingToId={activeReplyId}
            setReplyingToId={setActiveReplyId}
            onReplySubmit={handleReplySubmit}
            onToggleReplyById={handleToggleReply}
          />
        ))}
      </div>
    </Popover>
  );
}
