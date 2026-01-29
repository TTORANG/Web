import type { DropOffSlide, DropOffTime } from '@/types/insight';

import SlideThumb from './SlideThumb';

interface DropOffAnalysisSectionProps {
  cardClassName: string;
  thumbClassName: string;
  dropOffSlides: DropOffSlide[];
  dropOffTimes: DropOffTime[];
  getThumb: (slideIndex: number) => string | undefined;
  maxDropOffCount: number;
}

export default function DropOffAnalysisSection({
  cardClassName,
  thumbClassName,
  dropOffSlides,
  dropOffTimes,
  getThumb,
  maxDropOffCount,
}: DropOffAnalysisSectionProps) {
  const getProgressWidth = (count: number) => {
    if (maxDropOffCount === 0) return 0; // 0으로 나누기 방지
    return Math.round((count / maxDropOffCount) * 100);
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className={`${cardClassName} p-6`}>
        <h3 className="text-body-s text-gray-800 mb-4">가장 많이 이탈한 슬라이드</h3>
        <div className="space-y-4">
          {dropOffSlides.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SlideThumb
                  src={getThumb(item.slideIndex)}
                  alt={`${item.label} 썸네일`}
                  className="w-16 h-10 rounded object-cover"
                  fallbackClassName={`w-16 h-10 ${thumbClassName}`}
                />
                <div>
                  <div className="text-sm font-bold text-gray-800">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-500">{item.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`${cardClassName} p-6`}>
        <h3 className="text-body-s text-gray-800 mb-4">가장 많이 이탈한 영상 시간</h3>
        <div className="space-y-6">
          {dropOffTimes.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <SlideThumb
                src={getThumb(item.slideIndex)}
                alt={`슬라이드 ${item.slideIndex + 1} 썸네일`}
                className="w-16 h-10 shrink-0 rounded object-cover"
                fallbackClassName={`w-16 h-10 ${thumbClassName} shrink-0`}
              />
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <div>
                    <span className="text-sm font-bold text-gray-800 mr-2">{item.time}</span>
                    <span className="text-xs text-gray-500">{item.desc}</span>
                  </div>
                  <span className="text-sm font-bold text-red-500">{item.count}명</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-red-500 h-1.5 rounded-full"
                    style={{ width: `${getProgressWidth(item.count)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
