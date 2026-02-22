// src/pages/insight/charts/RetentionChartTooltip.tsx
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { TooltipContentProps } from 'recharts/types/component/Tooltip';

import type { ChartDataPoint } from '../types';

export function RetentionChartTooltip({
  active,
  payload,
  label,
  hasVideo,
  onVideoTimeClick,
  onSlidePointClick,
}: TooltipContentProps<ValueType, NameType> & {
  hasVideo: boolean;
  onVideoTimeClick?: (seconds: number) => void;
  onSlidePointClick?: (slideIndex: number) => void;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint;
    const labelText = String(label ?? data.tooltipTitle);
    const canSeekVideo =
      hasVideo &&
      typeof onVideoTimeClick === 'function' &&
      typeof data.seekSeconds === 'number' &&
      Number.isFinite(data.seekSeconds);
    const canSeekSlide =
      !hasVideo &&
      typeof onSlidePointClick === 'function' &&
      typeof data.slideIndex === 'number' &&
      Number.isInteger(data.slideIndex) &&
      data.slideIndex >= 0;
    const canSeek = canSeekVideo || canSeekSlide;

    const content = (
      <>
        {(hasVideo || data.thumbUrl) && (
          <div className="mb-2 h-24 w-42 overflow-hidden rounded bg-gray-100">
            {data.thumbUrl ? (
              <img
                src={data.thumbUrl}
                alt={hasVideo ? `${labelText} 시점 썸네일` : `${data.tooltipTitle} 썸네일`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-600">
                썸네일 없음
              </div>
            )}
          </div>
        )}

        <p className="mb-1 text-xs font-semibold text-gray-700">
          {hasVideo ? `재생 시간: ${labelText}` : data.tooltipTitle}
        </p>
        <div className="flex items-end gap-2">
          <p className="text-sm font-bold text-indigo-600">잔존율 {data.value}%</p>
          <span className="text-xs text-gray-700">({data.sessionCount}명)</span>
        </div>
        {canSeek && <p className="mt-2 text-[11px] font-semibold text-main">클릭해 이동</p>}
      </>
    );

    if (canSeek) {
      const seekSeconds = data.seekSeconds;
      const slideIndex = data.slideIndex;
      return (
        <button
          type="button"
          className="rounded-lg border border-gray-100 bg-white p-3 text-left shadow-lg focus-visible:outline-2 focus-visible:outline-main"
          onClick={() => {
            if (canSeekVideo && typeof seekSeconds === 'number') {
              onVideoTimeClick(seekSeconds);
              return;
            }

            if (
              canSeekSlide &&
              typeof slideIndex === 'number' &&
              Number.isInteger(slideIndex) &&
              slideIndex >= 0
            ) {
              onSlidePointClick(slideIndex);
            }
          }}
          aria-label={hasVideo ? `영상 ${labelText}로 이동` : `${data.tooltipTitle}로 이동`}
        >
          {content}
        </button>
      );
    }

    return (
      <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg">{content}</div>
    );
  }
  return null;
}
