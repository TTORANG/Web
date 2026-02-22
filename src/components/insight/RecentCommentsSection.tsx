// src/components/insight/RecentCommentsSection.tsx
import type { ReadRecentCommentListResponseDto } from '@/api/dto/analytics.dto';
import { RecentCommentItem } from '@/components/insight';
import { formatVideoTimestamp } from '@/utils/format';
import { getSlideTitle } from '@/utils/slideTitle';

const thumbBase = 'bg-gray-100 rounded-lg aspect-video';
const sampleComments = [
  {
    commentId: 'sample-1',
    user: 'Alex',
    slideNum: 2,
    time: '00:42',
    text: '중간 전환이 부드러워서 이해가 잘 됐어요.',
  },
  {
    commentId: 'sample-2',
    user: 'Jamie',
    slideNum: 5,
    time: '01:18',
    text: '이 부분은 근거를 한 줄만 더 넣어주면 좋겠어요.',
  },
  {
    commentId: 'sample-3',
    user: 'Min',
    slideNum: 7,
    time: '02:03',
    text: '결론을 조금 더 강조해주면 기억에 남을 것 같아요.',
  },
];

export function RecentCommentsSection({
  hasVideo,
  isVideoSource = true,
  recentCommentsData,
  onSeekCommentTime,
}: {
  hasVideo: boolean;
  isVideoSource?: boolean;
  recentCommentsData?: ReadRecentCommentListResponseDto;
  onSeekCommentTime?: (seconds: number) => void;
}) {
  const hasRecentComments = (recentCommentsData?.comments?.length ?? 0) > 0;
  const shouldShowOverlay = !hasVideo || !isVideoSource || !hasRecentComments;

  // 1. 영상이 없을 때 보여줄 샘플 댓글 렌더링 함수
  const renderSampleComments = () => (
    <>
      {sampleComments.map((comment, idx) => (
        <div key={comment.commentId} className={idx > 0 ? 'hidden md:block' : ''}>
          <RecentCommentItem
            user={comment.user}
            slideLabel={getSlideTitle(undefined, comment.slideNum)}
            time={comment.time}
            text={comment.text}
            thumbFallbackClassName={thumbBase}
          />
        </div>
      ))}
    </>
  );

  // 2. 실제 영상 데이터가 있을 때 댓글 렌더링 함수
  const renderActualComments = () => {
    // 댓글이 있는 경우 매핑해서 반환
    return (
      <>
        {recentCommentsData?.comments.slice(0, 5).map((comment) => {
          const seconds = Math.max(0, comment.timestampMs / 1000);
          const slideLabel = comment.slide
            ? getSlideTitle(comment.slide.title, comment.slide.slideNum)
            : '전체';
          return (
            <RecentCommentItem
              key={comment.commentId}
              user={comment.user.name}
              userProfileImage={
                comment.user.profileImage ?? comment.user.profileImageUrl ?? undefined
              }
              slideLabel={slideLabel}
              time={formatVideoTimestamp(seconds)}
              text={comment.content}
              thumbUrl={comment.slide?.imageUrl}
              thumbFallbackClassName={thumbBase}
              onThumbClick={onSeekCommentTime ? () => onSeekCommentTime(seconds) : undefined}
              onTimeClick={onSeekCommentTime ? () => onSeekCommentTime(seconds) : undefined}
            />
          );
        })}
      </>
    );
  };

  // 3. 메인 리턴 (UI 구조)
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative">
        {/* 콘텐츠 영역 (영상이 없으면 블러 처리) */}
        <div className="flex flex-col gap-2">
          <h3 className="text-body-l-bold text-gray-800">최근 댓글 피드백</h3>
          <div className={shouldShowOverlay ? 'blur-sm pointer-events-none select-none' : ''}>
            {shouldShowOverlay ? renderSampleComments() : renderActualComments()}
          </div>
        </div>

        {shouldShowOverlay ? (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center text-center pointer-events-auto"
            style={{
              borderRadius: '0.75rem',
              backgroundColor: 'var(--color-white)',
              background:
                'radial-gradient(ellipse 50% 50% at 50% 50%, color-mix(in srgb, var(--color-white) 22%, transparent) 0%, color-mix(in srgb, var(--color-white) 16%, transparent) 34%, color-mix(in srgb, var(--color-white) 9%, transparent) 60%, color-mix(in srgb, var(--color-white) 3%, transparent) 80%, color-mix(in srgb, var(--color-white) 1%, transparent) 92%, transparent 100%)',
            }}
          >
            <div className="px-6 py-5">
              {!hasVideo ? (
                <>
                  <p className="text-body-l-bold" style={{ color: 'var(--color-black)' }}>
                    영상을 녹화하면 더 자세한 분석을 받을 수 있어요
                  </p>
                  <ul
                    className="mt-3 mx-auto w-fit text-left text-body-m space-y-1"
                    style={{ color: 'var(--color-gray-900)' }}
                  >
                    <li>• 시청 구간별 이탈률 분석</li>
                    <li>• 영상 잔존율 그래프</li>
                    <li>• 타임라인 기반 댓글 피드백</li>
                  </ul>
                </>
              ) : !isVideoSource ? (
                <>
                  <p className="text-body-l-bold" style={{ color: 'var(--color-black)' }}>
                    분석 대상을 영상으로 선택하면 최근 댓글 피드백을 볼 수 있어요.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-body-l-bold" style={{ color: 'var(--color-black)' }}>
                    아직 등록된 댓글이 없습니다.
                  </p>
                  <p className="mt-2 text-body-m" style={{ color: 'var(--color-gray-900)' }}>
                    공유 링크로 피드백을 받아보세요.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
