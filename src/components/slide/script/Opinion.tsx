/**
 * @file Opinion.tsx
 * @description 의견 목록 팝오버
 *
 * 대본에 대한 팀원들의 의견을 보여주고, 답글을 달 수 있습니다.
 * Zustand store를 통해 의견 데이터를 읽고 업데이트합니다.
 */
import { useState } from 'react';

import clsx from 'clsx';

import { CommentItem, Popover } from '@/components/common';
import { useSlideActions, useSlideOpinions } from '@/hooks';

export default function Opinion() {
  const opinions = useSlideOpinions();
  const { deleteOpinion, addReply } = useSlideActions();
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (opinionId: string) => {
    if (replyText.trim()) {
      addReply(opinionId, replyText);
    }
    setActiveReplyId(null);
    setReplyText('');
  };

  const handleToggleReply = (opinionId: string) => {
    setActiveReplyId(activeReplyId === opinionId ? null : opinionId);
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
      <div className="h-80 overflow-y-auto">
        {opinions.map((opinion) => (
          <CommentItem
            key={opinion.id}
            comment={opinion}
            theme="light"
            isActive={activeReplyId === opinion.id}
            replyText={replyText}
            onReplyTextChange={setReplyText}
            onToggleReply={() => handleToggleReply(opinion.id)}
            onSubmitReply={() => handleReplySubmit(opinion.id)}
            onCancelReply={handleCancelReply}
            onDelete={opinion.isMine ? () => deleteOpinion(opinion.id) : undefined}
            isIndented={opinion.isReply}
          />
        ))}
      </div>
    </Popover>
  );
}
