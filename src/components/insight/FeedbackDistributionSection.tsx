import { REACTION_CONFIG, createDefaultReactions } from '@/constants/reaction';
import { useSlideReactionsTotal } from '@/hooks/useSlideReactions';
import type { Reaction } from '@/types/script';

interface FeedbackDistributionSectionProps {
  projectId: string;
}

export default function FeedbackDistributionSection({
  projectId,
}: FeedbackDistributionSectionProps) {
  const { data } = useSlideReactionsTotal(projectId);
  const baseReactions = createDefaultReactions();
  const reactions: Reaction[] = baseReactions.map((reaction) => ({
    ...reaction,
    count: data?.totalReactions[reaction.type] ?? 0,
  }));
  const total = reactions.reduce((sum, reaction) => sum + reaction.count, 0);
  const max = reactions.reduce((current, reaction) => Math.max(current, reaction.count), 1);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-body-l-bold text-gray-800">슬라이드 이모지 피드백 분포</h3>
        <span className="text-body-l-bold text-main-variant2">총 {total}개</span>
      </div>
      <div className="flex flex-col gap-6">
        {reactions.map((react) => {
          const ratio = Math.round((react.count / max) * 100);
          return (
            <div key={react.type} className="flex items-center">
              <div className="flex w-8 shrink-0 items-center gap-2 sm:w-32.5">
                <span className="text-body-l">{REACTION_CONFIG[react.type].emoji}</span>
                <span className="hidden text-body-m text-gray-800 sm:inline">
                  {REACTION_CONFIG[react.type].label}
                </span>
              </div>
              <div className="relative h-2 min-w-20 flex-1">
                <div className="absolute inset-0 rounded-full bg-gray-200" />
                <div
                  className="absolute left-0 top-0 h-2 rounded-full bg-main"
                  style={{ width: `${ratio}%` }}
                />
              </div>
              <div className="ml-2 w-10 shrink-0 text-right text-body-m-bold text-gray-800 sm:ml-4 sm:w-12">
                {react.count}개
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
