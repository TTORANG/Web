import type { DropOffSlide, DropOffTime } from '@/types/insight';

import SlideThumb from './SlideThumb';

interface DropOffAnalysisSectionProps {
  dropOffSlides: DropOffSlide[];
  dropOffTimes: DropOffTime[];
  getThumb: (slideIndex: number) => string | undefined;
  showVideoDropOff?: boolean;
}

export default function DropOffAnalysisSection({
  dropOffSlides,
  dropOffTimes,
  getThumb,
  showVideoDropOff = true,
}: DropOffAnalysisSectionProps) {
  return (
    <div className="flex gap-4">
      {/* 슬라이드 이탈 */}
      <div className="flex w-160 flex-col gap-1 rounded-lg border border-gray-200 bg-white px-5 py-4">
        <h3 className="text-body-l-bold text-gray-800">가장 많이 이탈한 슬라이드</h3>
        {dropOffSlides.map((item, idx) => (
          <div
            key={idx}
            className={`flex h-24.75 items-center gap-6 py-4 pr-2 ${
              idx < dropOffSlides.length - 1 ? 'border-b border-gray-200' : ''
            }`}
          >
            <SlideThumb
              src={getThumb(item.slideIndex)}
              alt={`${item.label} 썸네일`}
              className="h-16.75 w-30 shrink-0 rounded object-cover"
              fallbackClassName="h-[67px] w-[120px] shrink-0 rounded bg-gray-200"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-body-m-bold text-gray-800">{item.label}</span>
              <span className="text-caption text-gray-600">{item.desc}</span>
            </div>
            <div className="flex shrink-0 flex-col items-end">
              <span className="text-body-l-bold text-error">{item.percent}%</span>
              <span className="text-caption text-gray-600">이탈률</span>
            </div>
          </div>
        ))}
      </div>

      {/* 영상 구간 이탈 */}
      {showVideoDropOff && (
        <div className="flex w-160 flex-col gap-1 rounded-lg border border-gray-200 bg-white px-5 py-4">
          <h3 className="text-body-l-bold text-gray-800">가장 많이 이탈한 영상 구간</h3>
          {dropOffTimes.map((item, idx) => (
            <div
              key={idx}
              className={`flex h-24.75 items-center gap-6 py-4 pr-2 ${
                idx < dropOffTimes.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <SlideThumb
                src={getThumb(item.slideIndex)}
                alt={`슬라이드 ${item.slideIndex + 1} 썸네일`}
                className="h-16.75 w-30 shrink-0 rounded object-cover"
                fallbackClassName="h-[67px] w-[120px] shrink-0 rounded bg-gray-200"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-body-m-bold text-gray-800">{item.time}</span>
                <span className="text-caption text-gray-600">{item.desc}</span>
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <span className="text-body-l-bold text-error">{item.count}명</span>
                <span className="text-caption text-gray-600">이탈</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
