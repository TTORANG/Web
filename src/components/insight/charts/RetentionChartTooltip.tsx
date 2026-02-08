// src/pages/insight/charts/RetentionChartTooltip.tsx
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { TooltipContentProps } from 'recharts/types/component/Tooltip';

import type { ChartDataPoint } from '../types';

export function RetentionChartTooltip({
  active,
  payload,
  label,
  hasVideo,
}: TooltipContentProps<ValueType, NameType> & { hasVideo: boolean }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint;
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg">
        <p className="mb-1 text-xs font-semibold text-gray-500">
          {hasVideo ? `재생 시간: ${label}` : `슬라이드: ${data.tooltipTitle}`}
        </p>
        <div className="flex items-end gap-2">
          <p className="text-sm font-bold text-indigo-600">잔존율 {data.value}%</p>
          <span className="text-xs text-gray-400">({data.sessionCount}명)</span>
        </div>
      </div>
    );
  }
  return null;
}
