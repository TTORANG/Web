/**
 * @file ScriptBoxHeader.tsx
 * @description ScriptBox 헤더 영역
 *
 * 슬라이드 제목, 이모지 반응, 변경 기록, 의견, 접기 버튼을 포함합니다.
 * 모든 하위 컴포넌트는 Context를 통해 슬라이드 데이터에 접근합니다.
 */
import clsx from 'clsx';

import ArrowDownIcon from '@/assets/icons/icon-arrow-down.svg?react';
import { Skeleton } from '@/components/common';

import CommentPopover from './CommentPopover';
import ScriptBoxEmoji from './ScriptBoxEmoji';
import ScriptBulkEditControl from './ScriptBulkEditControl';
import ScriptHistory from './ScriptHistory';
import SlideTitle from './SlideTitle';

interface ScriptBoxHeaderProps {
  isCollapsed: boolean;
  isLoading?: boolean;
  onToggleCollapse: () => void;
}

export default function ScriptBoxHeader({
  isCollapsed,
  isLoading,
  onToggleCollapse,
}: ScriptBoxHeaderProps) {
  return (
    <div className="flex h-10 items-center justify-between rounded-t-lg border-b border-gray-200 bg-white px-2 sm:px-5">
      {/* 좌측: 슬라이드 제목 */}
      <div className="relative z-10 min-w-0 flex-1 bg-white">
        {isLoading ? (
          <Skeleton width={100} height={20} />
        ) : (
          <SlideTitle isCollapsed={isCollapsed} />
        )}
      </div>

      {/* 우측: 일괄 수정, 이모지, 변경기록, 의견, 접기 버튼 */}
      <div className="ml-2 flex shrink-0 items-center gap-1.5 sm:gap-3">
        <ScriptBoxEmoji />
        <ScriptBulkEditControl />
        <ScriptHistory />
        <CommentPopover isLoading={isLoading} />
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden h-6 w-6 items-center justify-center rounded bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-2 focus-visible:outline-main sm:flex"
          aria-label={isCollapsed ? '대본 펼치기' : '대본 접기'}
        >
          <ArrowDownIcon
            className={clsx(
              'h-4 w-4 transition-transform duration-300',
              isCollapsed && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
