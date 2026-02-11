// src/components/insight/RecentCommentsSection.tsx
import type { ReadRecentCommentListResponseDto } from '@/api/dto/analytics.dto';
import { RecentCommentItem } from '@/components/insight';
import { formatVideoTimestamp } from '@/utils/format';

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
  recentCommentsData,
}: {
  hasVideo: boolean;
  recentCommentsData?: ReadRecentCommentListResponseDto;
}) {
  // 1. 영상이 없을 때 보여줄 샘플 댓글 렌더링 함수
  const renderSampleComments = () => (
    <>
      {sampleComments.map((comment) => (
        <RecentCommentItem
          key={comment.commentId}
          user={comment.user}
          slideLabel={`슬라이드 ${comment.slideNum}`}
          time={comment.time}
          text={comment.text}
          thumbFallbackClassName={thumbBase}
        />
      ))}
    </>
  );

  // 2. 실제 영상 데이터가 있을 때 댓글 렌더링 함수
  const renderActualComments = () => {
    // 댓글이 없는 경우
    if (!recentCommentsData?.comments || recentCommentsData.comments.length === 0) {
      return (
        <div className="py-4 text-center text-gray-400 text-body-s">
          아직 등록된 댓글이 없습니다.
        </div>
      );
    }

    // 댓글이 있는 경우 매핑해서 반환
    return (
      <>
        {recentCommentsData.comments.slice(0, 5).map((comment) => (
          <RecentCommentItem
            key={comment.commentId}
            user={comment.user.name}
            userProfileImage={comment.user.profileImage}
            slideLabel={comment.slide ? `슬라이드 ${comment.slide.slideNum}` : '전체'}
            time={formatVideoTimestamp(comment.timestampMs / 1000)}
            text={comment.content}
            thumbUrl={comment.slide?.imageUrl}
            thumbFallbackClassName={thumbBase}
          />
        ))}
      </>
    );
  };

  // 3. 메인 리턴 (UI 구조)
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative">
        {/* 콘텐츠 영역 (영상이 없으면 블러 처리) */}
        <div
          className={`flex flex-col gap-2 ${
            !hasVideo ? 'blur-xs pointer-events-none select-none' : ''
          }`}
        >
          <h3 className="text-body-l-bold text-gray-800">최근 댓글 피드백</h3>

          {/* hasVideo 값에 따라 실제 댓글 vs 샘플 댓글 교차 렌더링 */}
          {hasVideo ? renderActualComments() : renderSampleComments()}
        </div>

        {/* 영상이 없을 때 뜨는 안내 문구 (오버레이) */}
        {!hasVideo && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-center pointer-events-auto">
            {/* 배경이 잘 보이도록 흰색 반투명 박스 추가 */}
            <div className="px-6 py-5">
              <p className="text-body-l-bold text-gray-800">
                영상을 녹화하면 더 자세한 분석을 받을 수 있어요
              </p>
              <ul className="mt-3 mx-auto w-fit text-left text-body-m text-gray-800 space-y-1">
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
