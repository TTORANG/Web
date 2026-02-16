import type { SummaryStat } from '@/types/insight';

interface SummaryStatsSectionProps {
  stats: SummaryStat[];
}

export default function SummaryStatsSection({ stats }: SummaryStatsSectionProps) {
  const mobileColsClass =
    stats.length <= 1 ? 'grid-cols-1' : stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

  const desktopColsClass =
    stats.length <= 1
      ? 'lg:grid-cols-1'
      : stats.length === 2
        ? 'lg:grid-cols-2'
        : stats.length === 3
          ? 'lg:grid-cols-3'
          : 'lg:grid-cols-4';

  return (
    <div className={`grid ${mobileColsClass} gap-4 ${desktopColsClass}`}>
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white px-5 py-4"
        >
          <div className="flex flex-col gap-1">
            <span className="text-body-s text-gray-800">{stat.label}</span>
            <span className="text-title-s-bold text-gray-800">{stat.value}</span>
          </div>
          {stat.trendValue && (
            <span
              className={`text-body-s ${
                stat.trend === 'up'
                  ? 'text-main'
                  : stat.trend === 'down'
                    ? 'text-error'
                    : 'text-gray-600'
              }`}
            >
              {stat.trend === 'up' && '↑ '}
              {stat.trend === 'down' && '↓ '}
              {stat.trendValue}
            </span>
          )}
          {stat.sub && !stat.trendValue && (
            <span className="text-body-s text-gray-600">{stat.sub}</span>
          )}
        </div>
      ))}
    </div>
  );
}
