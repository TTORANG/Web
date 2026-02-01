import { REACTION_CONFIG } from '@/constants/reaction';
import type { Reaction } from '@/types/script';

interface FeedbackDistributionSectionProps {
  reactions: Reaction[];
}

export default function FeedbackDistributionSection({
  reactions,
}: FeedbackDistributionSectionProps) {
  const total = reactions.reduce((sum, reaction) => sum + reaction.count, 0);
  const max = reactions.reduce((current, reaction) => Math.max(current, reaction.count), 1);

  return (
    <div className="mb-6 pr-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-body-l-bold text-gray-800">이모지 피드백 분포</h3>
        <span className="text-body-l-bold text-main">총 {total}개</span>
      </div>
      <div className="space-y-4">
        {reactions.map((react) => {
          const ratio = Math.round((react.count / max) * 100);
          return (
            <div key={react.type} className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-28 shrink-0">
                <span className="text-body-m">{REACTION_CONFIG[react.type].emoji}</span>
                <span className="text-body-m text-gray-800">
                  {REACTION_CONFIG[react.type].label}
                </span>
              </div>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-main-variant1"
                    style={{ width: `${ratio}%` }}
                  />
                </div>
              </div>
              <div className="w-10 text-right text-body-m-bold text-gray-800">{react.count}개</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
