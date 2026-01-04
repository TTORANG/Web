/**
 * @file Opinion.tsx
 * @description 의견 목록 팝오버
 *
 * 대본에 대한 팀원들의 의견을 보여주고, 답글을 달 수 있습니다.
 */
import { useState } from 'react';

import clsx from 'clsx';

import RemoveIcon from '@/assets/icons/icon-remove.svg?react';
import ReplyIcon from '@/assets/icons/icon-reply.svg?react';
import { Popover } from '@/components/common';
import type { OpinionItem } from '@/types/script';

interface OpinionProps {
  opinions?: OpinionItem[];
  opinionCount?: number;
  onDelete?: (id: number) => void;
  onReply?: (id: number, content: string) => void;
}

export default function Opinion({
  opinions = [
    {
      id: 0,
      author: '익명 사용자',
      content: '이 부분 설명이 명확해요!',
      timestamp: '방금 전',
      isMine: true,
    },
    {
      id: 1,
      author: '이영희',
      content: '이 부분 설명이 명확해요!',
      timestamp: '1시간 전',
      isMine: true,
    },
    {
      id: 2,
      author: '박민수',
      content: '이 부분 설명이 명확해요!',
      timestamp: '1시간 전',
      isMine: false,
      isReply: true,
      parentId: 1,
    },
    {
      id: 3,
      author: '김철수',
      content: '이 부분 설명이 명확해요!',
      timestamp: '1시간 전',
      isMine: false,
    },
  ],
  opinionCount = 3,
  onDelete,
  onReply,
}: OpinionProps) {
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (opinionId: number) => {
    if (replyText.trim()) {
      onReply?.(opinionId, replyText);
    }
    setActiveReplyId(null);
    setReplyText('');
  };

  return (
    <Popover
      trigger={({ isOpen }) => (
        <button
          type="button"
          aria-label={`의견 ${opinionCount}개 보기`}
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
            {opinionCount}
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
          <div key={opinion.id}>
            {/* 의견 항목 */}
            <div
              className={clsx(
                'flex gap-3 py-3 pr-4',
                opinion.isReply ? 'pl-15' : 'pl-4',
                activeReplyId === opinion.id ? 'bg-gray-100' : 'bg-white',
              )}
            >
              {/* 프로필 이미지 */}
              <div className="w-8 shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-400" />
              </div>

              {/* 의견 내용 */}
              <div className="flex flex-1 flex-col gap-1 pt-1.5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="max-w-50 truncate text-sm font-semibold text-gray-800">
                        {opinion.author}
                      </span>
                      <span className="text-xs font-medium text-gray-600">{opinion.timestamp}</span>
                    </div>

                    {opinion.isMine && (
                      <button
                        type="button"
                        onClick={() => onDelete?.(opinion.id)}
                        aria-label="의견 삭제"
                        className="flex items-center gap-1 text-xs font-semibold text-error active:opacity-80"
                      >
                        삭제
                        <RemoveIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm font-medium text-gray-800">{opinion.content}</p>
                </div>

                {/* 답글 버튼 */}
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveReplyId(activeReplyId === opinion.id ? null : opinion.id);
                      setReplyText('');
                    }}
                    aria-expanded={activeReplyId === opinion.id}
                    aria-label={`${opinion.author}에게 답글 달기`}
                    className={clsx(
                      'flex items-center gap-1 text-xs font-semibold',
                      activeReplyId === opinion.id
                        ? 'text-gray-400'
                        : 'text-main hover:text-main-variant1 active:text-main-variant2',
                    )}
                  >
                    답글
                    <ReplyIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* 답글 입력 */}
            {activeReplyId === opinion.id && (
              <div className="flex flex-col gap-1 bg-gray-100 pb-4 pl-15 pr-4">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="댓글을 입력하세요"
                  aria-label="답글 입력"
                  className="w-full border-b border-gray-400 bg-transparent px-0.5 py-2 text-base font-semibold text-gray-800 outline-none placeholder:text-gray-600 focus:border-main"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveReplyId(null);
                      setReplyText('');
                    }}
                    aria-label="답글 취소"
                    className="px-3 py-1.5 text-xs font-semibold text-gray-800 hover:text-gray-600"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReplySubmit(opinion.id)}
                    disabled={!replyText.trim()}
                    aria-label="답글 등록"
                    className={clsx(
                      'rounded-full bg-white px-3 py-1.5 text-xs font-semibold',
                      replyText.trim() ? 'text-main active:text-main-variant2' : 'text-gray-400',
                    )}
                  >
                    답글
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Popover>
  );
}
