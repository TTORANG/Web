import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import { Spinner } from '@/components/common';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import ScriptSection from '@/components/feedback/ScriptSection';
import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
import { useVideoComments } from '@/hooks/useVideoComments';
import { useVideoReactions } from '@/hooks/useVideoReactions';
import { MOCK_SLIDES } from '@/mocks/slides';
import { MOCK_VIDEO } from '@/mocks/videos';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Comment } from '@/types/comment';
import { formatVideoTimestamp } from '@/utils/format';

export default function FeedbackVideoPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [isLoading, setIsLoading] = useState(true);

  const initVideo = useVideoFeedbackStore((state) => state.initVideo);
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);
  const requestSeek = useVideoFeedbackStore((s) => s.requestSeek);

  const { comments, addComment, addReply, deleteComment } = useVideoComments();
  const { reactions, toggleReaction } = useVideoReactions();

  const [commentDraft, setCommentDraft] = useState('');

  // URL의 projectId를 활용해 해당 프로젝트 슬라이드만 필터링
  const projectSlides = useMemo(() => {
    const targetProjectId = `p${projectId ?? '1'}`;
    return MOCK_SLIDES.filter((slide) => slide.projectId === targetProjectId);
  }, [projectId]);

  // 해당 프로젝트 슬라이드의 전환 시간 계산 (영상 길이 기준, 개발 단계에서)
  const slideChangeTimes = useMemo(() => {
    const videoDuration = MOCK_VIDEO.duration;
    const slideCount = projectSlides.length;
    if (slideCount === 0) return [];
    return Array.from({ length: slideCount }).map((_, i) =>
      Math.floor(i * (videoDuration / slideCount)),
    );
  }, [projectSlides.length]);

  // 현재 재생 시간을 타임스탬프 문자열로 변환 (포커스 시 자동 삽입용)
  const timestampPrefix = useMemo(() => `${formatVideoTimestamp(currentTime)} `, [currentTime]);

  const handleAddComment = () => {
    if (!commentDraft.trim()) return;
    addComment(commentDraft, currentTime);
    setCommentDraft('');
  };

  const handleGoToTimeRef = useCallback(
    (ref: NonNullable<Comment['ref']>) => {
      if (ref.kind === 'video') requestSeek(ref.seconds);
    },
    [requestSeek],
  );

  // 비디오 초기화
  useEffect(() => {
    const timer = window.setTimeout(() => {
      initVideo(MOCK_VIDEO);
      setIsLoading(false);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [projectId, initVideo]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full px-35">
      <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-4">
        {/* 슬라이드 + 웹캠 + 재생바 (오버레이) */}
        <SlideWebcamStage
          slides={projectSlides}
          slideChangeTimes={slideChangeTimes}
          webcamVideoUrl={MOCK_VIDEO.videoUrl}
          onTimeUpdate={updateCurrentTime}
        />

        {/* 대본 섹션 */}
        <ScriptSection
          slides={projectSlides}
          slideChangeTimes={slideChangeTimes}
          currentTime={currentTime}
        />
      </div>

      <aside className="w-96 shrink-0 bg-gray-100 flex flex-col border-l border-gray-200">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <CommentList
            comments={comments}
            onAddReply={addReply}
            onGoToRef={handleGoToTimeRef}
            onDeleteComment={deleteComment}
          />
        </div>

        <div className="shrink-0 border-t border-black/5 flex flex-col gap-6 px-4 pb-6 pt-2">
          <CommentInput
            value={commentDraft}
            onChange={setCommentDraft}
            onSubmit={handleAddComment}
            onCancel={() => setCommentDraft('')}
            className="items-end w-86"
            initialValueOnFocus={timestampPrefix}
          />
          <ReactionButtons reactions={reactions} onToggleReaction={toggleReaction} />
        </div>
      </aside>
    </div>
  );
}
