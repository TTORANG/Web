/**
 * @file ScriptBoxHeader.tsx
 * @description ScriptBox 헤더 영역
 *
 * 슬라이드 제목, 이모지 반응, 변경 기록, 의견을 포함합니다.
 * 모든 하위 컴포넌트는 Context를 통해 슬라이드 데이터에 접근합니다.
 */
import clsx from 'clsx';

import { Skeleton } from '@/components/common';

import CommentPopover from './CommentPopover';
import ScriptBoxEmoji from './ScriptBoxEmoji';
import ScriptBulkEditControl from './ScriptBulkEditControl';
import ScriptHistory from './ScriptHistory';
import SlideTitle from './SlideTitle';

interface ScriptBoxHeaderProps {
  isLoading?: boolean;
  readOnly?: boolean;
}

export default function ScriptBoxHeader({ isLoading, readOnly = false }: ScriptBoxHeaderProps) {
  return (
    <div className="flex h-10 items-center justify-between rounded-t-lg border-b border-gray-200 bg-white px-2 sm:px-5">
      {/* 좌측: 슬라이드 제목 */}
      <div className="relative z-10 min-w-0 flex-1 bg-white">
        {isLoading ? <Skeleton width={100} height={20} /> : <SlideTitle readOnly={readOnly} />}
      </div>

      {/* 우측: 일괄 수정, 이모지, 변경기록, 의견 */}
      <div className="ml-2 flex shrink-0 items-center gap-1.5 sm:gap-3">
        <div
          className={clsx(
            'flex items-center gap-1.5 sm:gap-3',
            readOnly && 'pointer-events-none opacity-60',
          )}
        >
          <ScriptBoxEmoji />
          <ScriptBulkEditControl />
          <ScriptHistory />
          <CommentPopover isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
