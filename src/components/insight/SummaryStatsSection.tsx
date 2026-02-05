import type { SummaryStat } from '@/types/insight';

interface SummaryStatsSectionProps {
  stats: SummaryStat[];
  cardClassName: string;
  columns?: number;
}

export default function SummaryStatsSection({
  stats,
  cardClassName,
  columns = 4,
}: SummaryStatsSectionProps) {
  const columnClass =
    columns === 3
      ? 'grid-cols-3'
      : columns === 2
        ? 'grid-cols-2'
        : columns === 1
          ? 'grid-cols-1'
          : 'grid-cols-4';

  return (
    <div className={`grid ${columnClass} gap-4 mb-6`}>
      {stats.map((stat, idx) => (
        <div key={idx} className={`${cardClassName} p-5`}>
          <h3 className="text-body-s text-gray-800 mb-2">{stat.label}</h3>
          <div className="text-2xl font-bold text-gray-800 mb-2">{stat.value}</div>
          {stat.sub && <div className="text-body-s text-gray-600">{stat.sub}</div>}
        </div>
      ))}
    </div>
  );
}
