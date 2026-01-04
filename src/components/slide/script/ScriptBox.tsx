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
        'flex flex-col w-full rounded-t-lg bg-white shadow-sm',
        isCollapsed ? 'h-10' : 'h-[clamp(12rem,30vh,20rem)]',
      )}
    >
      {/* 헤더 - 고정 높이 */}
      <div className="shrink-0">
        <ScriptBoxHeader isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
      </div>

      {/* 콘텐츠 - 남은 공간 채움 */}
      {!isCollapsed && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScriptBoxContent />
        </div>
      )}
    </div>
  );
}
