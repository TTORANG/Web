import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipIndex } from 'recharts';

import type { ChartDataPoint } from '../types';
import { RetentionChartTooltip } from './RetentionChartTooltip';

interface Props {
  data: ChartDataPoint[];
  isVideo: boolean;
  needsRotation: boolean;
  onVideoTimeClick?: (seconds: number) => void;
  onSlidePointClick?: (slideIndex: number) => void;
}

export default function RetentionChartRenderer({
  data,
  isVideo,
  needsRotation,
  onVideoTimeClick,
  onSlidePointClick,
}: Props) {
  const canSeekVideoOnChart = isVideo && typeof onVideoTimeClick === 'function';
  const canSeekSlideOnChart = !isVideo && typeof onSlidePointClick === 'function';
  const canSeekOnChart = canSeekVideoOnChart || canSeekSlideOnChart;

  const handleSeekByActiveIndex = (activeIndex: number | TooltipIndex | undefined) => {
    const resolvedIndex = typeof activeIndex === 'number' ? activeIndex : Number(activeIndex);
    if (!Number.isInteger(resolvedIndex)) return;
    if (resolvedIndex < 0 || resolvedIndex >= data.length) return;

    const point = data[resolvedIndex];
    if (!point) return;

    if (canSeekVideoOnChart) {
      const seekSeconds = point.seekSeconds;
      if (typeof seekSeconds !== 'number' || !Number.isFinite(seekSeconds)) return;

      onVideoTimeClick?.(seekSeconds);
      return;
    }

    if (canSeekSlideOnChart) {
      const slideIndex = point.slideIndex;
      if (typeof slideIndex !== 'number' || !Number.isInteger(slideIndex) || slideIndex < 0) {
        return;
      }

      onSlidePointClick?.(slideIndex);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300} minWidth={0}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: needsRotation ? 40 : 0 }}
        style={canSeekOnChart ? { cursor: 'pointer' } : undefined}
        onClick={
          canSeekOnChart ? (state) => handleSeekByActiveIndex(state.activeTooltipIndex) : undefined
        }
      >
        <defs>
          <linearGradient
            id={`colorRate-${isVideo ? 'video' : 'slide'}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor="var(--color-main)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--color-main)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-gray-400)" />

        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'var(--color-gray-600)', fontWeight: 600 }}
          dy={10}
          interval="preserveStartEnd"
          minTickGap={needsRotation ? 15 : 30}
          angle={needsRotation ? -45 : 0}
          textAnchor={needsRotation ? 'end' : 'middle'}
        />

        <YAxis
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'var(--color-gray-600)' }}
          ticks={[0, 25, 50, 75, 100]}
          unit="%"
        />

        <Tooltip
          content={(props) => (
            <RetentionChartTooltip
              {...props}
              hasVideo={isVideo}
              onVideoTimeClick={onVideoTimeClick}
              onSlidePointClick={onSlidePointClick}
            />
          )}
          wrapperStyle={{ pointerEvents: 'auto' }}
          cursor={{ stroke: 'var(--color-error)', strokeDasharray: '4 4', strokeWidth: 1 }}
        />

        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-main)"
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#colorRate-${isVideo ? 'video' : 'slide'})`}
          dot={
            !isVideo ? { r: 4, fill: '#fff', stroke: 'var(--color-main)', strokeWidth: 2 } : false
          }
          activeDot={{ r: 5, fill: 'var(--color-error)', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
