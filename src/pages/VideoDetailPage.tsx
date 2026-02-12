import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { ReadVideoDetailResponseDto, VideoCommentDto } from '@/api/dto/video.dto';
import { videosApi } from '@/api/endpoints/videos';
import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
import { useVideoComments } from '@/hooks/useVideoComments';
import { useAuthStore } from '@/stores/authStore';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Comment as CommentType } from '@/types/comment';

/**
 * VideoCommentDto → Comment 타입 변환
 *
 * parentId가 있으면 답글, 없으면 루트 댓글.
 * 루트 댓글만 타임스탬프 ref를 가진다.
 */
function mapVideoComment(dto: VideoCommentDto): CommentType {
  const isReply = dto.parentId !== null;

  return {
    commentId: String(dto.commentId),
    serverId: String(dto.commentId),
    userId: String(dto.userId),
    userName: dto.writer,
    content: dto.content,
    createdAt: dto.createdAt,
    isMine: dto.isMine,
    isReply,
    parentId: dto.parentId ? String(dto.parentId) : undefined,
    ref:
      !isReply && dto.timestampMs != null
        ? { kind: 'video', seconds: dto.timestampMs / 1000 }
        : undefined,
  };
}

/**
 * flat 댓글 배열 → 타임스탬프별 feedbacks 그룹화
 *
 * 모든 댓글(루트+답글)을 루트 댓글의 타임스탬프 기준으로 그룹화한다.
 * 답글은 부모의 타임스탬프 그룹에 포함된다.
 */
function groupByTimestamp(allComments: CommentType[]) {
  // 루트 댓글 → 타임스탬프 매핑
  const rootTimestampMap = new Map<string, number>();
  for (const c of allComments) {
    if (!c.parentId && c.ref?.kind === 'video') {
      rootTimestampMap.set(c.commentId, c.ref.seconds * 1000);
    }
  }

  const grouped = new Map<number, CommentType[]>();
  for (const c of allComments) {
    // 답글이면 부모의 타임스탬프, 루트면 자기 타임스탬프
    const ts = c.parentId
      ? (rootTimestampMap.get(c.parentId) ?? 0)
      : c.ref?.kind === 'video'
        ? c.ref.seconds * 1000
        : 0;
    const arr = grouped.get(ts) ?? [];
    arr.push(c);
    grouped.set(ts, arr);
  }

  return Array.from(grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([timestampMs, comments]) => ({
      timestampMs,
      comments,
      reactions: [],
    }));
}

export default function VideoDetailPage() {
  const { videoId } = useParams<{ projectId: string; videoId: string }>();
  const currentUser = useAuthStore((state) => state.user);

  const { initVideo, requestSeek: requestSeekAction } = useVideoFeedbackStore();

  const [videoData, setVideoData] = useState<ReadVideoDetailResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [commentDraft, setCommentDraft] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [scrollToCommentId, setScrollToCommentId] = useState<string | undefined>(undefined);
  const [capturedTimestamp, setCapturedTimestamp] = useState<number | null>(null);

  const desktopPlaceholderRef = useRef<HTMLDivElement>(null);
  const [videoStyle, setVideoStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    opacity: 0,
  });

  const { comments, addComment, addReply, deleteComment, updateComment } = useVideoComments({
    onMutationSuccess: () => loadComments(),
  });

  /** 영상 상세 정보 로드 (최초 1회) */
  const loadVideoDetail = useCallback(async () => {
    if (!videoId) return;
    const response = await videosApi.getVideoDetail(videoId);
    if (response.data.resultType === 'SUCCESS') {
      const data = response.data.success!;
      setVideoData(data);
      return data;
    }
    return null;
  }, [videoId]);

  /** 전체 댓글 로드 (comments/all) → store 반영 */
  const loadComments = useCallback(async () => {
    if (!videoId) return;
    try {
      const response = await videosApi.getVideoCommentsAll(videoId);
      if (response.data.resultType === 'SUCCESS') {
        const allComments = response.data.success.comments.map(mapVideoComment);
        const feedbacks = groupByTimestamp(allComments);

        useVideoFeedbackStore.setState((state) => ({
          ...state,
          video: state.video ? { ...state.video, feedbacks } : null,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  }, [videoId]);

  /** 초기 로드: 영상 상세 + 전체 댓글 */
  useEffect(() => {
    const init = async () => {
      if (!videoId) return;
      setIsLoading(true);
      try {
        const detail = await loadVideoDetail();
        if (detail) {
          // 먼저 store 초기화 (빈 feedbacks)
          initVideo({
            videoId: detail.video.videoId,
            title: detail.video.title,
            videoUrl: detail.video.hlsMasterUrl,
            duration: detail.video.durationSeconds,
            feedbacks: [],
            comments: [],
            reactionEvents: [],
          });
          // 전체 댓글 로드
          await loadComments();
        }
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    };
    init();
  }, [videoId, loadVideoDetail, loadComments, initVideo]);

  const handleGoToTimeRef = useCallback(
    (ref: NonNullable<CommentType['ref']>) => {
      if (ref.kind === 'video') {
        requestSeekAction(ref.seconds);
      }
    },
    [requestSeekAction],
  );

  const handleInputFocus = useCallback(() => {
    if (capturedTimestamp === null) {
      setCapturedTimestamp(currentTime);
    }
  }, [capturedTimestamp, currentTime]);

  const handleAddMainComment = useCallback(async () => {
    if (!commentDraft.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const timestampToUse = capturedTimestamp ?? currentTime;
      const successId = await addComment(commentDraft, timestampToUse);
      if (successId) {
        setCommentDraft('');
        setCapturedTimestamp(null);
        await loadComments();
        setScrollToCommentId(successId);
        setTimeout(() => setScrollToCommentId(undefined), 500);
      }
    } finally {
      setIsSubmittingComment(false);
    }
  }, [commentDraft, isSubmittingComment, capturedTimestamp, currentTime, addComment, loadComments]);

  const handleCancelComment = useCallback(() => {
    setCommentDraft('');
    setCapturedTimestamp(null);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      const rect = desktopPlaceholderRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;
      setVideoStyle({
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        zIndex: 20,
        opacity: 1,
      });
    };
    window.addEventListener('resize', updatePosition);
    updatePosition();
    return () => window.removeEventListener('resize', updatePosition);
  }, [isLoading]);

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      <div className="flex flex-1 flex-col h-full min-w-0">
        <div className="flex shrink-0 flex-col items-center pt-10 pb-6 px-12 bg-gray-50">
          <div
            ref={desktopPlaceholderRef}
            className="aspect-video w-full max-w-[800px] bg-black rounded-lg shadow-md"
          />
        </div>
      </div>

      <aside className="w-[400px] shrink-0 flex flex-col border-l border-gray-200 bg-white">
        <div className="p-4 border-b">
          <h2 className="text-base font-bold text-gray-900">의견</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth">
          <CommentList
            comments={comments}
            scrollToCommentId={scrollToCommentId}
            onAddReply={addReply}
            onGoToRef={handleGoToTimeRef}
            onDeleteComment={deleteComment}
            onUpdateComment={updateComment}
            isLoading={isLoading}
            skipReplyFetch
          />
        </div>
        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
          <CommentInput
            value={commentDraft}
            onChange={setCommentDraft}
            onSubmit={handleAddMainComment}
            onCancel={handleCancelComment}
            onFocusCapture={handleInputFocus}
            disabled={isSubmittingComment}
            className="w-full"
          />
        </div>
      </aside>

      <div
        style={videoStyle}
        className="pointer-events-auto rounded-lg overflow-hidden ring-1 ring-black/5"
      >
        <SlideWebcamStage
          slides={[]}
          slideChangeTimes={[]}
          webcamVideoUrl={videoData?.video.hlsMasterUrl || ''}
          onTimeUpdate={setCurrentTime}
        />
      </div>
    </div>
  );
}
