import { useEffect, useState } from 'react';

import clsx from 'clsx';

import ScriptBoxContent from './ScriptBoxContent';
import ScriptBoxHeader from './ScriptBoxHeader';

interface ScriptBoxProps {
  slideTitle?: string;
  /**
   * [기존] ScriptBox는 내부에서만 접힘 상태를 알고 있었고,
   *       슬라이드(상단 콘텐츠)는 ScriptBox 상태에 맞춰 움직일 수 없었음.
   * [현재] 부모가 접힘 상태를 알 수 있어야 "슬라이드를 살짝 내려오는" UI 연동이 가능함.
   */
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function ScriptBox({
  slideTitle = '슬라이드 1',
  onCollapsedChange,
}: ScriptBoxProps) {
  // ScriptBox 접힌 상태인지 체크
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  /**
   *  접힘 상태가 바뀔 때마다 부모에게 알려줌
   * - 부모는 이 상태를 받아 슬라이드 영역에 transform/padding 등으로 반응하게 됨
   */
  useEffect(() => {
    onCollapsedChange?.(isCollapsed);
  }, [isCollapsed, onCollapsedChange]);

  return (
    <div className={clsx('w-full rounded-t-lg bg-white shadow-sm', isCollapsed ? 'h-10' : 'h-80')}>
      {/* 헤더는 그대로 */}
      <div className="h-12 relative">
        <ScriptBoxHeader
          slideTitle={slideTitle}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/**
       * 본문 영역만 따로 감싸서 접힘 애니메이션 처리
       *
       * 왜 wrapper를 하나 더 뒀나?
       * - 헤더는 popover 때문에 잘리면 안 됨 → overflow-hidden을 헤더가 아닌 "본문 wrapper"에만 적용
       * - 접힘 애니메이션은 "height 변화"로 처리하는 게 가장 예측 가능함
       *
       * [기존] translate로 박스를 숨김 → 공간 계산, popover, 클릭 영역이 꼬일 수 있음
       * [현재] content wrapper의 높이를 h-0으로 만들어 진짜로 본문이 없어지게 함(접힌 상태라면 아예 랜더 자체 하지 않음)
       */}
      <div
        className={clsx(
          'overflow-hidden transition-[height] duration-300 ease-out',
          isCollapsed ? 'h-0' : 'h-[280px]',
        )}
      >
        {!isCollapsed && <ScriptBoxContent />}
      </div>
    </div>
  );
}
