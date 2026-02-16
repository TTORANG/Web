import type { DropOffSlide, DropOffTime } from '@/types/insight';

import SlideThumb from './SlideThumb';

interface DropOffAnalysisSectionProps {
  dropOffSlides: DropOffSlide[];
  dropOffTimes: DropOffTime[];
  getThumb: (slideIndex: number) => string | undefined;
  showVideoDropOff?: boolean;
  onSlideThumbClick?: (slideIndex: number) => void;
  onVideoTimeClick?: (seconds: number) => void;
}

export default function DropOffAnalysisSection({
  dropOffSlides,
  dropOffTimes,
  getThumb,
  showVideoDropOff = true,
  onSlideThumbClick,
  onVideoTimeClick,
}: DropOffAnalysisSectionProps) {
  const isSlideOnly = !showVideoDropOff; // !hasVideo 일때
  const noDataMessage = '데이터를 분석 중이거나 결과가 없습니다.';
  const hasSlideDropOff = dropOffSlides.some((item) => item.count > 0);
  const hasVideoDropOff = dropOffTimes.some((item) => item.count > 0);

  const renderSlideThumb = (
    slideIndex: number,
    alt: string,
    className: string,
    fallbackClassName: string,
  ) => {
    const thumbNode = (
      <SlideThumb
        src={getThumb(slideIndex)}
        alt={alt}
        className={className}
        fallbackClassName={fallbackClassName}
      />
    );

    if (!onSlideThumbClick) {
      return thumbNode;
    }

    return (
      <button
        type="button"
        onClick={() => onSlideThumbClick(slideIndex)}
        aria-label={`${alt} 위치로 이동`}
        className="cursor-pointer rounded transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-main"
      >
        {thumbNode}
      </button>
    );
  };

  return (
    <div className="flex flex-wrap gap-4">
      {/* 슬라이드 이탈 */}
      <div className="flex min-w-0 flex-1 basis-full flex-col gap-1 rounded-lg border border-gray-200 bg-white px-5 py-4 lg:basis-160">
        <h3 className="text-body-l-bold text-gray-800">가장 많이 이탈한 슬라이드</h3>

        {!hasSlideDropOff ? (
          <div className="mt-4 flex h-24 items-center justify-center text-gray-600">
            <p>{noDataMessage}</p>
          </div>
        ) : isSlideOnly ? (
          // !hasVideo UI
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {dropOffSlides.map((item, idx) => (
              <div key={`${item.label}-${idx}`} className="flex flex-col items-center">
                {renderSlideThumb(
                  item.slideIndex,
                  `${item.label} 썸네일`,
                  'aspect-video w-full rounded-lg object-cover',
                  'aspect-video w-full rounded-lg bg-gray-200',
                )}

                <div className="mt-4 text-center">
                  <p className="text-body-l-bold text-gray-800">{item.label}</p>
                  <p className="mt-1 text-body-l-bold text-error">이탈률 {item.percent}%</p>
                  <p className="mt-1 text-body-s text-gray-600">({item.desc})</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // hasVideo UI
          dropOffSlides.map((item, idx) => (
            <div
              key={idx}
              className={`flex h-24.75 items-center gap-3 py-4 pr-2 md:gap-6 ${
                idx < dropOffSlides.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              {renderSlideThumb(
                item.slideIndex,
                `${item.label} 썸네일`,
                'h-12 w-20 shrink-0 rounded object-cover md:h-16.75 md:w-30',
                'h-12 w-20 shrink-0 rounded bg-gray-200 md:h-[67px] md:w-[120px]',
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-body-m-bold text-gray-800">{item.label}</span>
                <span className="text-caption text-gray-600">{item.desc}</span>
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <span className="text-body-l-bold text-error">{item.percent}%</span>
                <span className="text-caption text-gray-600">이탈률</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 영상 구간 이탈 */}
      {showVideoDropOff && (
        <div className="flex min-w-0 flex-1 basis-full flex-col gap-1 rounded-lg border border-gray-200 bg-white px-5 py-4 lg:basis-160">
          <h3 className="text-body-l-bold text-gray-800">가장 많이 이탈한 영상 구간</h3>
          {!hasVideoDropOff ? (
            <div className="mt-4 flex h-24 items-center justify-center text-gray-600">
              <p>{noDataMessage}</p>
            </div>
          ) : (
            dropOffTimes.map((item, idx) => (
              <div
                key={idx}
                className={`flex h-24.75 items-center gap-3 py-4 pr-2 md:gap-6 ${
                  idx < dropOffTimes.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                {renderSlideThumb(
                  item.slideIndex,
                  `슬라이드 ${item.slideIndex + 1} 썸네일`,
                  'h-12 w-20 shrink-0 rounded object-cover md:h-16.75 md:w-30',
                  'h-12 w-20 shrink-0 rounded bg-gray-200 md:h-[67px] md:w-[120px]',
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {onVideoTimeClick ? (
                    <button
                      type="button"
                      onClick={() => onVideoTimeClick(item.seconds)}
                      className="cursor-pointer truncate text-left text-body-m-bold text-main hover:underline focus-visible:outline-2 focus-visible:outline-main"
                      aria-label={`영상 ${item.time}로 이동`}
                    >
                      {item.time}
                    </button>
                  ) : (
                    <span className="truncate text-body-m-bold text-gray-800">{item.time}</span>
                  )}
                  <span className="text-caption text-gray-600">{item.desc}</span>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="text-body-l-bold text-error">{item.count}명</span>
                  <span className="text-caption text-gray-600">이탈</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
