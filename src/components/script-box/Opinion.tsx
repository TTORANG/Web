import React from 'react';

import replyIcon from '../assets/icons/replyIcon.svg';
import treshcanIcon from '../assets/icons/treshcanIcon.svg';

type OpinionProps = {
  opinion: {
    value: boolean;
    toggle: () => void;
    off: () => void;
  };

  activeReplyIdx: number | null;
  setActiveReplyIdx: React.Dispatch<React.SetStateAction<number | null>>;
  replyText: string;
  // React.SetStateAction : 상태를 바꾸는 set 함수의 타입은 이런 식으로 명시함
  setReplyText: React.Dispatch<React.SetStateAction<string>>;
};

const Opinion = ({
  opinion,
  activeReplyIdx,
  setActiveReplyIdx,
  replyText,
  setReplyText,
}: OpinionProps) => {
  return (
    <div className="relative inline-block align-top">
      {/* (기존 그대로) 의견 버튼 */}
      <button
        onClick={opinion.toggle}
        className={`
          h-7 px-2 rounded outline outline-1 outline-offset-[-1px]
          inline-flex items-center gap-1
          ${
            opinion.value
              ? 'outline-indigo-500 text-indigo-500 bg-white'
              : 'outline-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50'
          }
        `}
        aria-pressed={opinion.value}
      >
        <span className="text-sm font-semibold leading-5">의견</span>
        <span
          className={`${
            opinion.value ? 'text-indigo-500' : 'text-gray-500'
          } text-sm font-semibold leading-5`}
        >
          3
        </span>
      </button>

      {/* (기존 그대로) 의견 popover */}
      {opinion.value && (
        <>
          {/* 바깥 클릭 시 닫기 */}
          <div className="fixed inset-0 z-40" onClick={opinion.off} />

          <div
            className="absolute z-50
              right-0 bottom-full mb-2
              origin-bottom-right
              w-[384px] max-w-[90vw]
              rounded-lg overflow-hidden bg-white
              shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]
            "
          >
            <div className="px-4 py-3 bg-white border-b border-zinc-200 flex items-center justify-between">
              <div className="text-zinc-700 text-base font-semibold leading-6">의견</div>
            </div>

            <div className="h-80 overflow-y-auto">
              {[0, 1, 2, 3].map((idx) => {
                const isMine = idx < 2;
                const hasReply = idx === 2;

                return (
                  <div
                    key={idx}
                    className={`
                      ${hasReply ? 'pl-14 pr-4' : 'px-4'}
                      py-3 bg-white
                      flex items-start gap-3
                    `}
                    title={''}
                  >
                    <div className="h-20 flex items-start gap-2.5">
                      <div className="w-8 h-8 bg-zinc-300 rounded-full" />
                    </div>

                    <div className="flex-1 pt-1.5 flex flex-col gap-1">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="max-w-48 text-zinc-700 text-sm font-semibold leading-5 line-clamp-1">
                              {isMine ? '익명 사용자' : '김철수'}
                            </div>
                            <div className="text-gray-500 text-xs font-medium leading-4">
                              {idx === 0 ? '방금 전' : '1시간 전'}
                            </div>
                          </div>

                          {isMine && (
                            <button
                              type="button"
                              className="flex items-center gap-1 text-red-500 text-xs font-semibold leading-4 hover:opacity-80"
                            >
                              삭제
                              <img src={treshcanIcon} className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="text-zinc-700 text-sm font-medium leading-5">
                          이 부분 설명이 명확해요!
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* ✅ 기존 로직 그대로 유지
                            - setActiveReplyIdx: 같은 댓글 다시 누르면 닫기(toggle)
                            - setReplyText: 새로 열 때 입력 초기화 */}
                        <button
                          type="button"
                          className="flex items-center gap-1 text-indigo-500 text-xs font-semibold leading-4 hover:opacity-80"
                          onClick={() => {
                            setActiveReplyIdx((prev) => (prev === idx ? null : idx));
                            setReplyText('');
                          }}
                        >
                          답글
                          <img src={replyIcon} className="w-4 h-4" />
                        </button>

                        {/* 답글 inputBox 렌더링 */}
                        {activeReplyIdx === idx && (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="답글을 입력하세요"
                              className="flex-1 h-10 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-indigo-500"
                            />
                            {/* 서버 붙기 전: 아무 것도 안 하고 닫기만 */}
                            <button
                              type="button"
                              className="h-10 px-3 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:opacity-90"
                              onClick={() => {
                                setActiveReplyIdx(null);
                                setReplyText('');
                              }}
                            >
                              등록
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Opinion;
