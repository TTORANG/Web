import clsx from 'clsx';

import SmallArrowIcon from '@/assets/icons/smallArrowIcon.svg?react';

import Opinion from './Opinion';
import ScriptBoxEmoji from './ScriptBoxEmoji';
import ScriptHistory from './ScriptHistory';
import SlideTitle from './SlideTitle';

interface ScriptBoxHeaderProps {
  slideTitle: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ScriptBoxHeader({
  slideTitle,
  isCollapsed,
  onToggleCollapse,
}: ScriptBoxHeaderProps) {
  return (
    <div className="flex h-10 items-center justify-between border-b border-gray-200 bg-white px-4">
      {/* 좌측: 접기 버튼 + 슬라이드 제목 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-gray-100"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? '대본 펼치기' : '대본 접기'}
        >
          <SmallArrowIcon
            className={clsx(
              'h-4 w-4 transition-transform duration-300',
              !isCollapsed && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>

        <SlideTitle initialTitle={slideTitle} />
      </div>

      {/* 우측: 이모지, 변경기록, 의견 */}
      <div className="flex items-center gap-3">
        <ScriptBoxEmoji />
        <ScriptHistory />
        <Opinion />
      </div>
    </div>
  );
}
