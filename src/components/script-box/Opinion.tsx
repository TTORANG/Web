import { useState } from 'react';

import clsx from 'clsx';

import replyIcon from '../../assets/icons/replyIcon.svg';
import trashcanIcon from '../../assets/icons/trashcanIcon.svg';
import { Popover } from '../common';

interface OpinionItem {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  isMine: boolean;
  isReply?: boolean;
}

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
      author: '익명 사용자',
      content: '이 부분 설명이 명확해요!',
      timestamp: '1시간 전',
      isMine: true,
    },
    {
      id: 2,
      author: '김철수',
      content: '이 부분 설명이 명확해요!',
      timestamp: '1시간 전',
      isMine: false,
      isReply: true,
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

  const trigger = (
    <button
      type="button"
      className={clsx(
        'inline-flex h-7 items-center gap-1 rounded px-2',
        'bg-white outline outline-1 outline-offset-[-1px] outline-gray-200',
        'hover:bg-gray-100',
      )}
    >
      <span className="text-sm font-semibold leading-5 text-gray-800">의견</span>
      <span className="text-sm font-semibold leading-5 text-gray-500">{opinionCount}</span>
    </button>
  );

  return (
    <Popover
      trigger={trigger}
      position="top"
      align="end"
      className="w-96 max-w-[90vw] overflow-hidden"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <span className="text-base font-semibold leading-6 text-gray-800">의견</span>
      </div>

      {/* 의견 목록 */}
      <div className="h-80 overflow-y-auto">
        {opinions.map((opinion) => (
          <div
            key={opinion.id}
            className={clsx(
              'flex items-start gap-3 bg-white py-3',
              opinion.isReply ? 'pl-14 pr-4' : 'px-4',
            )}
          >
            {/* 프로필 이미지 */}
            <div className="flex h-20 items-start gap-2.5">
              <div className="h-8 w-8 rounded-full bg-gray-300" />
            </div>

            {/* 의견 내용 */}
            <div className="flex flex-1 flex-col gap-1 pt-1.5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="max-w-48 text-sm font-semibold leading-5 text-gray-800 line-clamp-1">
                      {opinion.author}
                    </span>
                    <span className="text-xs font-medium leading-4 text-gray-500">
                      {opinion.timestamp}
                    </span>
                  </div>

                  {opinion.isMine && (
                    <button
                      type="button"
                      onClick={() => onDelete?.(opinion.id)}
                      className="flex items-center gap-1 text-xs font-semibold leading-4 text-red-500 hover:opacity-80"
                    >
                      삭제
                      <img src={trashcanIcon} alt="" className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <p className="text-sm font-medium leading-5 text-gray-800">{opinion.content}</p>
              </div>

              {/* 답글 버튼 */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveReplyId(activeReplyId === opinion.id ? null : opinion.id);
                    setReplyText('');
                  }}
                  className="flex items-center gap-1 text-xs font-semibold leading-4 text-main hover:opacity-80"
                >
                  답글
                  <img src={replyIcon} alt="" className="h-4 w-4" />
                </button>
              </div>

              {/* 답글 입력 */}
              {activeReplyId === opinion.id && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="답글을 입력하세요"
                    className="h-10 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-main"
                  />
                  <button
                    type="button"
                    onClick={() => handleReplySubmit(opinion.id)}
                    className="h-10 rounded-lg bg-gray-900 px-3 text-sm font-semibold text-white hover:opacity-90"
                  >
                    등록
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Popover>
  );
}
