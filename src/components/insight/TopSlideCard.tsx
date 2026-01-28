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
        <img src={thumbUrl} alt={`${title} 썸네일`} className="h-60 w-full object-cover" />
      ) : (
        <div className={`h-60 w-full ${thumbFallbackClassName}`} aria-hidden="true" />
      )}
      <div className="p-4">
        <div className="text-body-m-bold text-gray-800 mb-2">{title}</div>
        <div className="flex flex-wrap items-center gap-3 text-caption text-gray-800">
          {reactionMetrics.map((reaction) => (
            <span key={reaction.type} className="flex items-center gap-1">
              {REACTION_CONFIG[reaction.type].emoji} {reaction.count}
            </span>
          ))}
        </div>
        <div className="mt-3 flex justify-end gap-1 text-caption text-gray-600">
          <CommentIcon /> {commentCount}
        </div>
      </div>
    </div>
  );
}
