// src/pages/insight/charts/RetentionChartCard.tsx
import { Suspense, lazy } from 'react';

import { Spinner } from '@/components/common';
import type { ChartDataPoint } from '../types';

const RetentionChartRenderer = lazy(() => import('./RetentionChartRenderer'));

interface Props {
  title: string;
  data: ChartDataPoint[];
  isVideo: boolean;
}

export function RetentionChartCard({ title, data, isVideo }: Props) {
  const needsRotation = data.length > 10;

  return (
    <div className="flex w-full flex-col gap-6 rounded-lg border border-gray-200 bg-white px-5 pb-8 pt-4">
      <h3 className="text-body-l-bold text-gray-800">{title}</h3>

      <div className="h-[300px] w-full min-w-0 px-0 md:px-6">
        {data.length > 0 ? (
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <Spinner size={28} />
              </div>
            }
          >
            <RetentionChartRenderer data={data} isVideo={isVideo} needsRotation={needsRotation} />
          </Suspense>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-600">
            <p>데이터를 분석 중이거나 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
