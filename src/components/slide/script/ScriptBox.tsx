import { useEffect, useState } from 'react';

import clsx from 'clsx';

import ScriptBoxContent from './ScriptBoxContent';
import ScriptBoxHeader from './ScriptBoxHeader';

/**
 * 목적:
 * - ScriptBox 접힘/펼침 상태를 부모에게 전달
 * - 부모는 이 상태를 받아 슬라이드를 "살짝 내려오는" UI로 동기화
 */
interface ScriptBoxProps {
  slideTitle?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function ScriptBox({
  slideTitle = '슬라이드 1',
  onCollapsedChange,
}: ScriptBoxProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  useEffect(() => {
    onCollapsedChange?.(isCollapsed);
  }, [isCollapsed, onCollapsedChange]);

  return (
    <div
      className={clsx(
        'w-full rounded-t-lg bg-white shadow-sm',
        // 변경: 펼친 높이를 화면에 비례하도록 (작은 화면에서 과도하게 커지지 않게)
        // 큰 모니터에서 슬라이드와 대본박스 여백 조절할 때 20rem 조절

        isCollapsed ? 'h-10' : 'h-[clamp(12rem,30vh,20rem)]', // 192px ~ 320px
      )}
    >
      <div className="h-12 relative">
        <ScriptBoxHeader
          slideTitle={slideTitle}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      <div
        className={clsx(
          'overflow-hidden transition-[height] duration-300 ease-out',
          isCollapsed ? 'h-10' : 'h-[clamp(12rem,30vh,20rem)]',
        )}
      >
        {!isCollapsed && <ScriptBoxContent />}
      </div>
    </div>
  );
}
