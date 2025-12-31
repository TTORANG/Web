import { useState } from 'react';

import clsx from 'clsx';

import ScriptBoxContent from './ScriptBoxContent';
import ScriptBoxHeader from './ScriptBoxHeader';

interface ScriptBoxProps {
  slideTitle?: string;
}

export default function ScriptBox({ slideTitle = '슬라이드 1' }: ScriptBoxProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div
      className={clsx(
        'fixed inset-x-0 bottom-0 z-30',
        'mx-auto w-full bg-white',
        'transition-transform duration-300 ease-out',
        'h-80',
        isCollapsed ? 'translate-y-[calc(100%-2.5rem)]' : 'translate-y-0',
      )}
    >
      <ScriptBoxHeader
        slideTitle={slideTitle}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <ScriptBoxContent />
    </div>
  );
}
