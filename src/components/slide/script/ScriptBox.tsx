/**
 * @file ScriptBox.tsx
 * @description 슬라이드 대본 박스 (메인 컨테이너)
 *
 * 슬라이드 하단에 위치하는 대본 편집 영역입니다.
 * 접힘/펼침 상태를 관리하고 부모(SlideWorkspace)에게 전달합니다.
 */
import { useEffect, useState } from 'react';

import clsx from 'clsx';

import ScriptBoxContent from './ScriptBoxContent';
import ScriptBoxHeader from './ScriptBoxHeader';

interface ScriptBoxProps {
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function ScriptBox({ onCollapsedChange }: ScriptBoxProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  /**
   * 대본 박스의 접힘/펼침 상태를 토글합니다.
   */
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
        <ScriptBoxHeader isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
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
