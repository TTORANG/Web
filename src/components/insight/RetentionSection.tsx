// src/pages/insight/sections/RetentionSection.tsx
import { RetentionChartCard } from './charts/RetentionChartCard';
import type { ChartDataPoint } from './types';

export function RetentionSection({
  title,
  data,
  isVideo,
}: {
  title: string;
  data: ChartDataPoint[];
  isVideo: boolean;
}) {
  return <RetentionChartCard title={title} data={data} isVideo={isVideo} />;
}
