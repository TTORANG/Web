import CommentIcon from '@/assets/icons/icon-comment-count.svg?react';
import { REACTION_CONFIG } from '@/constants/reaction';
import type { Reaction } from '@/types/script';

interface TopSlideCardProps {
  title: string;
  thumbUrl?: string;
  reactionMetrics: Reaction[];
  commentCount: number;
  cardClassName: string;
  thumbFallbackClassName: string;
}

export default function TopSlideCard({
  title,
  thumbUrl,
  reactionMetrics,
  commentCount,
  cardClassName,
  thumbFallbackClassName,
}: TopSlideCardProps) {
  return (
    <div className={`${cardClassName} overflow-hidden`}>
      {thumbUrl ? (
        <img src={thumbUrl} alt={`${title} 썸네일`} className="block w-full" />
      ) : (
        <div className={`h-44 w-full ${thumbFallbackClassName}`} aria-hidden="true" />
      )}
      <div className="p-3">
        <div className="text-body-m-bold text-gray-800 mb-3">{title}</div>
        <div className="space-y-2">
          {reactionMetrics.map((reaction) => (
            <div
              key={reaction.type}
              className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-caption text-gray-800"
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{REACTION_CONFIG[reaction.type].emoji}</span>
                {REACTION_CONFIG[reaction.type].label}
              </span>
              <span className="text-caption text-gray-800">{reaction.count}</span>
            </div>
          ))}
          {reactionMetrics.length === 0 && (
            <div className="text-body-s text-gray-400">아직 반응이 없어요.</div>
          )}
          <div className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-caption text-gray-800">
            <span className="flex items-center gap-2">
              <CommentIcon aria-hidden="true" />
              <span>댓글</span>
            </span>
            <span className="text-caption text-gray-800">{commentCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
