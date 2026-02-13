import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { ReadVideoDetailResponseDto, VideoCommentDto } from '@/api/dto/video.dto';
import { getScript } from '@/api/endpoints/scripts';
import { videosApi } from '@/api/endpoints/videos';
import { CommentInput } from '@/components/comment';
// CommentList 추가
import Comment from '@/components/comment/Comment';
import { CommentProvider } from '@/components/comment/CommentContext';
import ScriptSection from '@/components/feedback/ScriptSection';
import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
import { useSlides } from '@/hooks/queries/useSlides';
import { useVideoComments } from '@/hooks/useVideoComments';
import { useAuthStore } from '@/stores/authStore';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { SlideListItem } from '@/types';
import type { Comment as CommentType } from '@/types/comment';
import type { VideoTimestampFeedback } from '@/types/video';

export default function VideoDetailPage() {
  const { projectId, videoId } = useParams<{ projectId: string; videoId: string }>();
  const currentUser = useAuthStore((state) => state.user);

  const { initVideo, requestSeek: requestSeekAction } = useVideoFeedbackStore();

  const [videoData, setVideoData] = useState<ReadVideoDetailResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [commentDraft, setCommentDraft] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  // 💡 scrollToCommentId 상태 삭제 (Unused variable 경고 해결)

  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const { data: slidesData } = useSlides(projectId!);
  const [projectSlides, setProjectSlides] = useState<SlideListItem[]>([]);
  const [slideChangeTimes, setSlideChangeTimes] = useState<number[]>([]);
  const [slideIdOrder, setSlideIdOrder] = useState<string[]>([]);

  const desktopPlaceholderRef = useRef<HTMLDivElement>(null);
  const [videoStyle, setVideoStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    opacity: 0,
  });

  const transformComments = useCallback(
    (serverComments: VideoCommentDto[]): CommentType[] => {
      const dedupedComments = [
        ...new Map(serverComments.map((c) => [String(c.commentId), c])).values(),
      ];
      const rootTimestampById = new Map<string, number>();
      for (const comment of dedupedComments) {
        if (comment.parentId) continue;
        if (typeof comment.timestampMs === 'number') {
          rootTimestampById.set(String(comment.commentId), comment.timestampMs);
        }
      }

      const mapped = dedupedComments.map((comment) => {
        const commentId = String(comment.commentId);
        const parentId = comment.parentId ? String(comment.parentId) : undefined;
        const threadTimestampMs =
          typeof comment.timestampMs === 'number'
            ? comment.timestampMs
            : parentId
              ? rootTimestampById.get(parentId)
              : undefined;

        return {
          commentId,
          serverId: commentId,
          userId: String(comment.userId),
          userName: comment.writer || undefined,
          content: comment.content,
          createdAt: comment.createdAt,
          isMine: Boolean(comment.isMine) || String(comment.userId) === String(currentUser?.id),
          parentId,
          isReply: Boolean(parentId),
          ref:
            typeof threadTimestampMs === 'number'
              ? { kind: 'video' as const, seconds: threadTimestampMs / 1000 }
              : undefined,
          replies: [],
        };
      });

      const getThreadTimestamp = (comment: CommentType) => {
        if (comment.ref?.kind === 'video') return Math.round(comment.ref.seconds * 1000);
        if (comment.parentId)
          return rootTimestampById.get(comment.parentId) ?? Number.MAX_SAFE_INTEGER;
        return Number.MAX_SAFE_INTEGER;
      };

      return mapped.sort((a, b) => {
        const timestampDiff = getThreadTimestamp(a) - getThreadTimestamp(b);
        if (timestampDiff !== 0) return timestampDiff;

        if (a.isReply !== b.isReply) {
          return a.isReply ? 1 : -1;
        }

        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    },
    [currentUser?.id],
  );

  const buildFeedbacks = useCallback((flatComments: CommentType[]): VideoTimestampFeedback[] => {
    if (flatComments.length === 0) return [];

    const grouped = new Map<number, CommentType[]>();

    for (const comment of flatComments) {
      const timestampMs =
        comment.ref?.kind === 'video' ? Math.round(comment.ref.seconds * 1000) : 0;
      const commentsAtTimestamp = grouped.get(timestampMs) ?? [];
      commentsAtTimestamp.push(comment);
      grouped.set(timestampMs, commentsAtTimestamp);
    }

    return [...grouped.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([timestampMs, comments]) => ({
        timestampMs,
        comments,
        reactions: [],
      }));
  }, []);

  const { comments, addComment, addReply, deleteComment, updateComment } = useVideoComments({
    onMutationSuccess: () => loadData(false),
  });

  const loadData = useCallback(
    async (isInitial = false) => {
      if (!videoId) return;
      try {
        const [detailResponse, commentsResponse] = await Promise.all([
          videosApi.getVideoDetail(videoId),
          videosApi.getVideoCommentsAll(videoId),
        ]);

        if (detailResponse.data.resultType === 'SUCCESS') {
          const data = detailResponse.data.success!;
          setVideoData(data);
          const flatComments =
            commentsResponse.data.resultType === 'SUCCESS'
              ? transformComments(commentsResponse.data.success.comments ?? [])
              : [];
          const feedbacks = buildFeedbacks(flatComments);

          if (isInitial) {
            initVideo({
              videoId: data.video.videoId,
              title: data.video.title,
              videoUrl: data.video.hlsMasterUrl,
              duration: data.video.durationSeconds,
              feedbacks,
              comments: [],
              reactionEvents: [],
            });
          } else {
            useVideoFeedbackStore.setState((state) => ({
              ...state,
              video: state.video
                ? {
                    ...state.video,
                    feedbacks,
                  }
                : null,
            }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    },
    [videoId, initVideo, transformComments, buildFeedbacks],
  );

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadData(true);
      if (videoId) {
        const slidesRes = await videosApi.getVideoSlides(videoId);
        if (slidesRes.data.resultType === 'SUCCESS') {
          const slides = slidesRes.data.success.slides;
          setSlideIdOrder(slides.map((s) => s.slideId));
          setSlideChangeTimes(slides.map((s) => s.timestampMs / 1000));
        }
      }
      setIsLoading(false);
    };
    init();
  }, [videoId, loadData]);

  const contextValue = useMemo(
    () => ({
      replyingToId,
      replyDraft,
      setReplyDraft,
      toggleReply: (id: string) => {
        setReplyingToId((prev) => (prev === id ? null : id));
        setReplyDraft('');
      },
      submitReply: async (targetId: string) => {
        if (replyDraft.trim()) {
          await addReply(targetId, replyDraft);
          setReplyDraft('');
          setReplyingToId(null);
        }
      },
      cancelReply: () => {
        setReplyingToId(null);
        setReplyDraft('');
      },
      editingId,
      editDraft,
      setEditDraft,
      startEdit: (id: string, content: string) => {
        setEditingId(id);
        setEditDraft(content);
      },
      cancelEdit: () => {
        setEditingId(null);
        setEditDraft('');
      },
      submitEdit: async (id: string) => {
        if (editDraft.trim()) {
          await updateComment(id, editDraft);
          setEditingId(null);
          setEditDraft('');
        }
      },
      deleteComment,
      skipReplyFetch: true,
      goToRef: (ref: { kind: 'slide'; index: number } | { kind: 'video'; seconds: number }) => {
        if (ref.kind === 'video') {
          requestSeekAction(ref.seconds);
        }
      },
    }),
    [
      replyingToId,
      replyDraft,
      editingId,
      editDraft,
      addReply,
      updateComment,
      deleteComment,
      requestSeekAction,
    ],
  );

  const handleAddMainComment = async () => {
    if (!commentDraft.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const successId = await addComment(commentDraft, currentTime);
      if (successId) {
        setCommentDraft('');
        await loadData(false);
        // 💡 렌더링 후 해당 댓글로 스크롤 (상태 변수 대신 직접 DOM 접근)
        setTimeout(() => {
          document
            .getElementById(`comment-${successId}`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

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

  useEffect(() => {
    if (!slidesData || slideIdOrder.length === 0) return;
    const loadScripts = async () => {
      const ordered = await Promise.all(
        slideIdOrder.map(async (id) => {
          const slideBase = slidesData.find((s) => String(s.slideId) === String(id));
          if (!slideBase) return null;
          try {
            const scriptRes = await getScript(String(id));
            return { ...slideBase, script: scriptRes.scriptText || '' };
          } catch {
            return { ...slideBase, script: slideBase.script || '' };
          }
        }),
      );
      setProjectSlides(ordered.filter((s): s is SlideListItem => s !== null));
    };
    loadScripts();
  }, [slidesData, slideIdOrder]);

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div
      role="tabpanel"
      id="tabpanel-videos"
      aria-labelledby="tab-videos"
      className="flex h-full w-full bg-white overflow-hidden"
    >
      <div className="flex flex-1 flex-col h-full min-w-0">
        <div className="flex shrink-0 flex-col items-center pt-10 pb-6 px-12 ">
          <div
            ref={desktopPlaceholderRef}
            className="aspect-video w-full max-w-[800px] rounded-lg shadow-md"
          />
        </div>
        <div className="flex-1 min-h-0 px-12 pb-6 flex flex-col items-center">
          <div className="w-full max-w-[800px] h-full flex flex-col min-h-0 overflow-y-auto">
            <ScriptSection
              slides={projectSlides}
              slideChangeTimes={slideChangeTimes}
              currentTime={currentTime}
              onSeek={requestSeekAction}
            />
          </div>
        </div>
      </div>

      <aside className="w-[400px] shrink-0 flex flex-col border-l border-gray-200 bg-white">
        <div className="p-4 border-b">
          <h2 className="text-base font-bold text-gray-900">의견</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth">
          <CommentProvider value={contextValue}>
            <div className="flex flex-col">
              {comments.map((comment) => (
                <Comment
                  key={comment.commentId}
                  comment={comment}
                  rootCommentId={comment.commentId}
                />
              ))}
            </div>
          </CommentProvider>
        </div>
        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
          <CommentInput
            value={commentDraft}
            onChange={setCommentDraft}
            onSubmit={handleAddMainComment}
            onCancel={() => setCommentDraft('')}
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
          slides={projectSlides}
          slideChangeTimes={slideChangeTimes}
          webcamVideoUrl={videoData?.video.hlsMasterUrl || ''}
          onTimeUpdate={setCurrentTime}
        />
      </div>
    </div>
  );
}
