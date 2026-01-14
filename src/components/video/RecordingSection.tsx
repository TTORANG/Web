import { useEffect, useState } from 'react';

import { ActionButton } from '@/components/common';

export const RecordingSection = () => {
  const [timer, setTimer] = useState(0);

  return (
    <div className="flex h-full w-full gap-6 p-6 overflow-hidden bg-[#1a1a1a]">
      <div className="relative flex flex-1 flex-col items-center justify-center min-w-0">
        <div className="relative aspect-[16/9] w-full bg-[#2a2d34] rounded-xl overflow-hidden shadow-2xl border border-white/5">
          <div className="flex h-full w-full items-center justify-center text-white/20">
            Slide Content Area
          </div>

          <div className="absolute bottom-4 right-4 w-48 aspect-video rounded-lg border-2 border-[#5162ff] bg-black overflow-hidden shadow-lg"></div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs">
            스페이스바 또는 화살표를 클릭하여 다음 슬라이드로 이동하세요
          </div>
        </div>
      </div>

      <aside className="w-80 shrink-0 flex flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-white/60">다음 슬라이드</p>
          <div className="aspect-video w-full bg-[#2a2d34] rounded-lg border border-white/10" />
        </div>

        <div className="flex flex-1 flex-col gap-2 min-h-0">
          <p className="text-xs font-bold text-white/60">발표 대본</p>
          <div className="flex-1 bg-[#2a2d34] p-4 rounded-lg border border-white/10 overflow-y-auto">
            <p className="text-sm text-white/80 leading-relaxed">
              지난 분기 실적을 보시면, 매출이 전년 대비 30% 증가했습니ek
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};
