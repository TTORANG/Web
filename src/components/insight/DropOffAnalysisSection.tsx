import type { DropOffSlide, DropOffTime } from '@/types/insight';

import SlideThumb from './SlideThumb';

interface DropOffAnalysisSectionProps {
  cardClassName: string;
  thumbClassName: string;
  dropOffSlides: DropOffSlide[];
  dropOffTimes: DropOffTime[];
  getThumb: (slideIndex: number) => string | undefined;
  showVideoDropOff?: boolean;
}

export default function DropOffAnalysisSection({
  cardClassName,
  thumbClassName,
  dropOffSlides,
  dropOffTimes,
  getThumb,
  showVideoDropOff = true,
}: DropOffAnalysisSectionProps) {
  return (
    <div className={`grid gap-4 mb-6 ${showVideoDropOff ? 'grid-cols-2' : 'grid-cols-1'}`}>
      <div className={`${cardClassName} p-6`}>
        <h3 className="text-body-l-bold text-gray-800 mb-4">가장 많이 이탈한 슬라이드</h3>
        <div className="space-y-4">
          {dropOffSlides.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SlideThumb
                  src={getThumb(item.slideIndex)}
                  alt={`${item.label} 썸네일`}
                  className="w-25 h-16 rounded object-cover"
                  fallbackClassName={`w-25 h-16 ${thumbClassName}`}
                />
                <div>
                  <div className="font-semibold text-gray-800">{item.label}</div>
                  <div className="text-caption text-gray-600">{item.desc}</div>
                </div>
              </div>
              <div className="flex flex-col items-end leading-none">
                <span className="text-body-l-bold text-error">{item.percent}%</span>
                <span className="mt-1 text-caption text-gray-600">이탈률</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showVideoDropOff && (
        <div className={`${cardClassName} p-6`}>
          <h3 className="text-body-l-bold text-gray-800 mb-4">가장 많이 이탈한 영상 시간</h3>
          <div className="space-y-4">
            {dropOffTimes.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <SlideThumb
                  src={getThumb(item.slideIndex)}
                  alt={`슬라이드 ${item.slideIndex + 1} 썸네일`}
                  className="w-25 h-16 rounded object-cover"
                  fallbackClassName={`w-25 h-16 ${thumbClassName}`}
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{item.time}</div>
                  <div className="text-caption text-gray-600">{item.desc}</div>
                </div>
                <div className="flex flex-col items-end leading-none">
                  <span className="text-body-l-bold text-error">{item.count}명</span>
                  <span className="mt-1 text-caption text-gray-600">이탈</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
