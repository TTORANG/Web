/**
 * @file ScriptBoxHeader.tsx
 * @description ScriptBox 헤더 영역
 *
 * 슬라이드 제목, 이모지 반응, 변경 기록, 의견, 접기 버튼을 포함합니다.
 * 모든 하위 컴포넌트는 Context를 통해 슬라이드 데이터에 접근합니다.
 */
import clsx from 'clsx';

import ArrowDownIcon from '@/assets/icons/icon-arrow-down.svg?react';

import Opinion from './Opinion';
import ScriptBoxEmoji from './ScriptBoxEmoji';
import ScriptHistory from './ScriptHistory';
import SlideTitle from './SlideTitle';

interface ScriptBoxHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ScriptBoxHeader({ isCollapsed, onToggleCollapse }: ScriptBoxHeaderProps) {
  return (
    <div className="flex h-10 items-center justify-between border-b border-gray-200 bg-white px-5">
      {/* 좌측: 슬라이드 제목 */}
      <SlideTitle isCollapsed={isCollapsed} />

      {/* 우측: 이모지, 변경기록, 의견, 접기 버튼 */}
      <div className="flex items-center gap-3">
        <ScriptBoxEmoji />
        <ScriptHistory />
        <Opinion />
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 active:bg-gray-200"
          aria-expanded={!isCollapsed}
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
