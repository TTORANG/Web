/**
 * @file ScriptHistory.tsx
 * @description 대본 변경 기록 팝오버
 *
 * 대본의 이전 버전들을 보여주고, 원하는 버전으로 복원할 수 있습니다.
 * Zustand store를 통해 변경 기록을 읽고 복원합니다.
 */
import clsx from 'clsx';

import RevertIcon from '@/assets/icons/icon-revert.svg?react';
import { Popover } from '@/components/common';
import { useSlideActions, useSlideHistory, useSlideScript } from '@/hooks';

export default function ScriptHistory() {
  const script = useSlideScript();
  const history = useSlideHistory();
  const { restoreFromHistory } = useSlideActions();
  return (
    <Popover
      trigger={({ isOpen }) => (
        <button
          type="button"
          aria-label="대본 변경 기록 보기"
          className={clsx(
            'inline-flex h-7 items-center gap-1 rounded pl-2 pr-1.5',
            'outline-1 -outline-offset-1',
            isOpen
              ? 'bg-white text-main outline-main'
              : 'bg-white text-gray-800 outline-gray-200 hover:bg-gray-100 active:bg-gray-200',
          )}
        >
          <span className="text-sm font-semibold leading-5">변경 기록</span>
          <RevertIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      position="top"
      align="end"
      ariaLabel="대본 변경 기록"
      className="w-popover max-w-[90vw] overflow-hidden rounded-b-lg"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <span className="text-base font-semibold leading-6 text-gray-800">대본 변경 기록</span>
      </div>

      {/* 콘텐츠 */}
      <div className="max-h-80 overflow-y-auto">
        {/* 현재 대본 */}
        <div className="border-b border-gray-200 bg-gray-100 px-4 pb-4 pt-3">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold leading-4 text-gray-600">현재</span>
            <p className="text-sm font-medium leading-5 text-gray-800">
              {script || '(대본이 비어있습니다)'}
            </p>
          </div>
        </div>

        {/* 히스토리 목록 */}
        {history.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-600">변경 기록이 없습니다</div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="border-b border-gray-200 bg-white px-4 pb-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium leading-4 text-gray-600">
                  {item.timestamp}
                </span>
                <button
                  type="button"
                  onClick={() => restoreFromHistory(item)}
                  aria-label={`${item.timestamp} 버전으로 복원`}
                  className={clsx(
                    'inline-flex items-center gap-1 rounded py-1 pl-2 pr-1.5',
                    'bg-white text-gray-800 outline-1 -outline-offset-1 outline-gray-200',
                    'hover:text-gray-600 active:bg-gray-100',
                  )}
                >
                  <span className="text-xs font-semibold leading-4">복원</span>
                  <RevertIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-2 text-sm font-medium leading-5 text-gray-800">{item.content}</p>
            </div>
          ))
        )}
      </div>
    </Popover>
  );
}
