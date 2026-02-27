/**
 * @file ScriptBox.tsx
 * @description 슬라이드 대본 박스 (메인 컨테이너)
 *
 * 슬라이드 하단에 위치하는 대본 편집 영역입니다.
 */
import { Skeleton } from '@/components/common';

import ScriptBoxContent from './ScriptBoxContent';
import ScriptBoxHeader from './ScriptBoxHeader';

interface ScriptBoxProps {
  isLoading?: boolean;
  readOnly?: boolean;
}

export default function ScriptBox({ isLoading, readOnly = false }: ScriptBoxProps) {
  return (
    <div className="flex h-[clamp(12rem,30vh,20rem)] w-full flex-col rounded-t-lg bg-white shadow-sm">
      {/* 헤더 - 고정 높이 */}
      <div className="shrink-0">
        <ScriptBoxHeader isLoading={isLoading} readOnly={readOnly} />
      </div>

      {/* 콘텐츠 - 남은 공간 채움 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="h-full bg-white px-4 pt-3 pb-6">
            <Skeleton.Text lines={4} lineHeight={16} gap={10} lastLineWidth={0.6} />
          </div>
        ) : (
          <ScriptBoxContent readOnly={readOnly} />
        )}
      </div>
    </div>
  );
}
