import { REACTION_CONFIG } from '@/constants/reaction';
import type { Reaction } from '@/types/script';

interface FeedbackDistributionSectionProps {
  cardClassName: string;
  reactions: Reaction[];
}

export default function FeedbackDistributionSection({
  cardClassName,
  reactions,
}: FeedbackDistributionSectionProps) {
  return (
    <div className={`${cardClassName} p-8 mb-6`}>
      <h3 className="text-body-s text-gray-800 mb-6">피드백 분포</h3>
      <div className="flex justify-around items-center">
        {reactions.map((react, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <div className="text-3xl p-3 rounded-full w-16 h-16 flex items-center justify-center">
              {REACTION_CONFIG[react.type].emoji}
            </div>
            <div className="text-body-s text-gray-600">{REACTION_CONFIG[react.type].label}</div>
            <div className="text-2xl font-bold text-gray-800">{react.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
