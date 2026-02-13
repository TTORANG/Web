import { REACTION_CONFIG } from '@/constants/reaction';
import type { Reaction } from '@/types/script';

interface TopSlideCardProps {
  title: string;
  thumbUrl?: string;
  reactionMetrics: Reaction[];
}

export default function TopSlideCard({ title, thumbUrl, reactionMetrics }: TopSlideCardProps) {
  // 상위 2개 리액션만 표시
  const topReactions = reactionMetrics.slice(0, 2);

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 sm:w-50.75">
      {/* 썸네일 */}
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={`${title} 썸네일`}
          className="h-28.25 w-full rounded-t-lg object-cover"
        />
      ) : (
        <div
          className="h-28.25 w-full rounded-t-lg bg-gray-200"
          role="img"
          aria-label={`${title} 썸네일 (이미지 없음)`}
        />
      )}

      {/* 콘텐츠 */}
      <div className="flex flex-col gap-4 bg-white px-4 pb-4 pt-3">
        <span className="truncate text-body-m-bold text-gray-800">{title}</span>
        <div className="flex min-h-15 flex-col gap-2">
          {topReactions.map((reaction) => (
            <div
              key={reaction.type}
              className="flex items-center justify-between rounded bg-gray-100 px-2 py-1 text-caption text-gray-800"
            >
              <span>
                {REACTION_CONFIG[reaction.type].emoji} {REACTION_CONFIG[reaction.type].label}
              </span>
              <span>{reaction.count}</span>
            </div>
          ))}
          {topReactions.length === 0 && (
            <div className="text-body-s text-gray-400">아직 반응이 없어요.</div>
          )}
        </div>
      </div>
    </div>
  );
}
