import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { ReadVideoDetailResponseDto } from '@/api/dto/video.dto';
import { createReply, deleteComment, updateComment } from '@/api/endpoints/comments';
import { getScript } from '@/api/endpoints/scripts';
import { createVideoComment, videosApi } from '@/api/endpoints/videos';
import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import ScriptSection from '@/components/feedback/ScriptSection';
import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
import { useSlides } from '@/hooks/queries/useSlides';
import { useAuthStore } from '@/stores/authStore';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { SlideListItem } from '@/types';
import type { Comment as CommentType } from '@/types/comment';

export default function VideoDetailPage() {
  const { projectId, videoId } = useParams<{ projectId: string; videoId: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const requestSeekAction = useVideoFeedbackStore((s) => s.requestSeek);

  const [videoData, setVideoData] = useState<ReadVideoDetailResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentDraft, setCommentDraft] = useState('');

  const { data: slidesData } = useSlides(projectId!);

  const [projectSlides, setProjectSlides] = useState<SlideListItem[]>([]);
  const [slideChangeTimes, setSlideChangeTimes] = useState<number[]>([]);
  const [slideIdOrder, setSlideIdOrder] = useState<string[]>([]);

  const placeholderRef = useRef<HTMLDivElement>(null);
  const [videoStyle, setVideoStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    opacity: 0,
  });

  // 1. 데이터 로드 로직
  useEffect(() => {
    const loadData = async () => {
      if (!videoId) return;
      setIsLoading(true);
      try {
        const response = await videosApi.getVideoDetail(videoId);
        if (response.data.resultType === 'SUCCESS') {
          const data = response.data.success!;
          setVideoData(data);

          // 댓글 데이터 변환
          const transformed = (data.timeline?.comments ?? []).map((comment) => ({
            commentId: comment.commentId,
            content: comment.content,
            ref: { kind: 'video', seconds: comment.timestampMs / 1000 },
            createdAt: comment.createdAt,
            userId: comment.user.userId,
            isMine: comment.user.userId === currentUser?.id,
            replies:
              comment.replies?.map((r) => ({
                commentId: r.replyId,
                content: r.content,
                createdAt: r.createdAt,
                userId: r.user.userId,
                isMine: r.user.userId === currentUser?.id,
                isReply: true,
                parentId: comment.commentId,
              })) ?? [],
          }));
          setComments(transformed as CommentType[]);
        }

        const slidesRes = await videosApi.getVideoSlides(videoId);
        if (slidesRes.data.resultType === 'SUCCESS') {
          const slides = slidesRes.data.success.slides;
          setSlideIdOrder(slides.map((s) => s.slideId));
          setSlideChangeTimes(slides.map((s) => s.timestampMs / 1000));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [videoId, currentUser?.id]);

  // 2. 슬라이드 정렬
  useEffect(() => {
    if (!slidesData || slideIdOrder.length === 0) return;

    const loadScriptsAndOrder = async () => {
      const ordered = await Promise.all(
        slideIdOrder.map(async (id) => {
          const slideBase = slidesData.find((s) => String(s.slideId) === String(id));
          if (!slideBase) return null;

          try {
            const scriptRes = await getScript(String(id));

            return {
              slideId: slideBase.slideId,
              imageUrl: slideBase.imageUrl,
              script: scriptRes.scriptText || '',
            };
          } catch (err) {
            return {
              slideId: slideBase.slideId,
              imageUrl: slideBase.imageUrl,
              script: slideBase.script || '',
            };
          }
        }),
      );

      setProjectSlides(ordered.filter((s): s is SlideListItem => s !== null));
    };

    loadScriptsAndOrder();
  }, [slidesData, slideIdOrder]);
  useEffect(() => {
    const updatePosition = () => {
      // 0. 로딩 중일 때는 계산하지 않음
      if (isLoading) return;

      const rect = placeholderRef.current?.getBoundingClientRect();

      // 1. 만약 아직 DOM이 제대로 안 그려져서 width가 0이라면 무시
      if (!rect || rect.width === 0) return;

      setVideoStyle({
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        zIndex: 20,
        opacity: 1,
        transition: 'all 0.15s ease-out',
      });
    };

    // 2. 초기 렌더링 시점에 브라우저 레이아웃이 잡힐 때까지 여러 번 재시도
    const timers = [0, 100, 300, 500].map((delay) => setTimeout(updatePosition, delay));

    // 3. ResizeObserver는 요소의 크기 변화를 실시간 감지
    const observer = new ResizeObserver(updatePosition);
    if (placeholderRef.current) {
      observer.observe(placeholderRef.current);
    }

    // 4. 스크롤이나 리사이즈 이벤트에도 대응
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isLoading, videoData, projectSlides]); // 👈 데이터 로드 완료 시점을 의존성에 추가

  const requestSeek = useCallback((time: number) => requestSeekAction(time), [requestSeekAction]);

  const handleAddComment = useCallback(async () => {
    if (!commentDraft.trim() || !videoId) return;
    try {
      const result = await createVideoComment(videoId, {
        content: commentDraft,
        timestampMs: Math.round(currentTime * 1000),
      });
      setComments((prev) => [
        ...prev,
        {
          commentId: result.serverId,
          content: result.content,
          ref: { kind: 'video', seconds: currentTime },
          createdAt: new Date().toISOString(),
          userId: currentUser?.id || 'me',
          isMine: true,
          replies: [],
        },
      ]);
      setCommentDraft('');
    } catch (err) {
      alert('댓글 추가 실패');
    }
  }, [commentDraft, currentTime, videoId, currentUser]);

  const handleReplyComment = useCallback(
    async (parentId: string, content: string) => {
      if (!content.trim()) return;

      try {
        // API 호출: 부모 댓글 ID를 경로 파라미터로 사용
        const result = await createReply(parentId, { content });

        // 로컬 상태 업데이트
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.commentId === parentId) {
              return {
                ...comment,
                replies: [
                  ...(comment.replies || []),
                  {
                    commentId: result.replyId,
                    content: result.content,
                    createdAt: result.createdAt,
                    userId: currentUser?.id || 'me',
                    isMine: true,
                    isReply: true,
                    parentId: parentId,
                  },
                ],
              };
            }
            return comment;
          }),
        );
      } catch (err) {
        console.error('답글 작성 실패:', err);
        alert('답글 작성 중 오류가 발생했습니다.');
      }
    },
    [currentUser],
  );

  // 2. 댓글/답글 수정 핸들러
  const handleUpdateComment = useCallback(async (commentId: string, content: string) => {
    if (!content.trim()) return;

    try {
      const result = await updateComment(commentId, { content });

      setComments((prev) =>
        prev.map((c) => {
          // 부모 댓글인 경우
          if (c.commentId === commentId) return { ...c, content: result.content };

          // 답글 중 하나인 경우
          return {
            ...c,
            replies: c.replies?.map((r) =>
              r.commentId === commentId ? { ...r, content: result.content } : r,
            ),
          };
        }),
      );
    } catch (err) {
      console.error('수정 실패:', err);
      alert('수정 중 오류가 발생했습니다.');
    }
  }, []);

  // 3. 댓글/답글 삭제 핸들러
  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deleteComment({ commentId });

      setComments((prev) =>
        prev
          .filter((c) => c.commentId !== commentId) // 부모 댓글 필터링
          .map((c) => ({
            ...c,
            replies: c.replies?.filter((r) => r.commentId !== commentId), // 답글 필터링
          })),
      );
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  }, []);

  if (isLoading)
    return <div className="flex h-screen items-center justify-center bg-gray-100">로딩 중...</div>;

  return (
    <div className="flex h-full w-full bg-gray-100 overflow-hidden">
      <div className="flex flex-1 flex-col px-6 py-6 md:px-12">
        <div className="mb-6 flex items-center gap-4"></div>

        <div className="flex flex-1 flex-col gap-6 min-h-0 items-center">
          <div ref={placeholderRef} className="aspect-video w-[80%] bg-black" />

          {/* 스크립트 섹션 */}
          <div className="w-[85%] flex-1 min-h-0">
            <ScriptSection
              slides={projectSlides}
              slideChangeTimes={slideChangeTimes}
              currentTime={currentTime}
              onSeek={requestSeek}
            />
          </div>
        </div>
      </div>

      <aside className="hidden w-100 shrink-0 flex-col border border-gray-200 bg-white lg:flex my-2 mr-20 shadow-sm">
        {/* 댓글 목록 영역 */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="mt-4 p-3 border-b">
            <h3 className="text-gray-950 font-bold">의견 ({comments.length})</h3>
          </div>
          <CommentList
            comments={comments}
            onGoToRef={(ref) => ref.kind === 'video' && requestSeek(ref.seconds)}
            onAddReply={handleReplyComment}
            onDeleteComment={handleDeleteComment}
            onUpdateComment={handleUpdateComment}
          />
        </div>

        {/* 댓글 입력창 영역 */}
        <div className="shrink-0 border-t border-gray-200 p-4 rounded-b-2xl">
          <CommentInput
            value={commentDraft}
            onChange={setCommentDraft}
            onSubmit={handleAddComment}
            onCancel={() => setCommentDraft('')}
            initialValueOnFocus={`[${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60)
              .toString()
              .padStart(2, '0')}] `}
          />
        </div>
      </aside>
      {/* 실제 비디오 렌더링 (CSS 포지셔닝) */}
      <div style={videoStyle} className="pointer-events-auto">
        <SlideWebcamStage
          slides={projectSlides}
          slideChangeTimes={slideChangeTimes}
          webcamVideoUrl={videoData?.video.hlsMasterUrl || ''}
          onTimeUpdate={setCurrentTime}
        />
      </div>
    </div>
  );
}
