// src/pages/insight/sections/RecentCommentsSection.tsx
import type { ReadRecentCommentListResponseDto } from '@/api/dto/analytics.dto';
import { RecentCommentItem } from '@/components/insight';
import { formatVideoTimestamp } from '@/utils/format';

const thumbBase = 'bg-gray-100 rounded-lg aspect-video';

export function RecentCommentsSection({
  hasVideo,
  recentCommentsData,
}: {
  hasVideo: boolean;
  recentCommentsData?: ReadRecentCommentListResponseDto;
}) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative">
        <div
          className={`flex flex-col gap-2 ${!hasVideo ? 'blur-[3px] pointer-events-none select-none' : ''}`}
        >
          <h3 className="text-body-l-bold text-gray-800">최근 댓글 피드백</h3>

          {recentCommentsData?.comments && recentCommentsData.comments.length > 0 ? (
            recentCommentsData.comments.map((comment) => (
              <RecentCommentItem
                key={comment.commentId}
                user={comment.user.name}
                slideLabel={`슬라이드 ${comment.slide.slideNum}`}
                time={formatVideoTimestamp(comment.timestampMs / 1000)}
                text={comment.content}
                thumbUrl={comment.slide.imageUrl}
                thumbFallbackClassName={thumbBase}
              />
            ))
          ) : (
            <div className="py-4 text-center text-gray-400 text-body-s">
              아직 등록된 댓글이 없습니다.
            </div>
          )}
        </div>

        {!hasVideo && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-center pointer-events-auto">
            <div className="px-6 py-5">
              <p className="text-body-l-bold text-gray-800">
                영상을 녹화하면 더 자세한 분석을 받을 수 있어요
              </p>
              <ul className="mt-3 mx-auto w-fit text-left text-body-m text-gray-800">
                <li>• 시청 구간별 이탈률 분석</li>
                <li>• 영상 잔존율 그래프</li>
                <li>• 타임라인 기반 댓글 피드백</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
