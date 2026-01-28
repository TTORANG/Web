type SummaryStat = {
  label: string;
  value: string;
  sub: string;
  trend?: 'up' | 'down';
};

interface SummaryStatsSectionProps {
  stats: SummaryStat[];
  cardClassName: string;
}

const trendLabel = (trend: Exclude<SummaryStat['trend'], undefined>) =>
  trend === 'up' ? '↑' : '↓';
const trendColor = (trend: Exclude<SummaryStat['trend'], undefined>) =>
  trend === 'up' ? 'text-main-variant1' : 'text-error';

export default function SummaryStatsSection({ stats, cardClassName }: SummaryStatsSectionProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div key={idx} className={`${cardClassName} p-5`}>
          <h3 className="text-body-s text-gray-800 mb-2">{stat.label}</h3>
          <div className="text-2xl font-bold text-gray-800 mb-2">{stat.value}</div>
          <div
            className={`text-body-s flex items-center gap-1 ${
              stat.trend ? trendColor(stat.trend) : 'text-gray-600'
            }`}
          >
            {stat.trend && <span aria-hidden="true">{trendLabel(stat.trend)}</span>}
            <span>{stat.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
