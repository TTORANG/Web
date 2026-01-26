import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import { Spinner } from '@/components/common';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import ScriptSection from '@/components/feedback/ScriptSection';
import SlideWebcamStage from '@/components/feedback/SlideWebcamStage';
import { MOCK_SLIDES, MOCK_SLIDE_CHANGE_TIMES } from '@/mocks/slides';
import { MOCK_VIDEO } from '@/mocks/videos';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Comment } from '@/types/comment';

import { useVideoComments } from '../hooks/useVideoComments';
import { useVideoReactions } from '../hooks/useVideoReactions';

export default function FeedbackVideoPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  const initVideo = useVideoFeedbackStore((state) => state.initVideo);

  const { comments, addComment, addReply, deleteComment } = useVideoComments();
  const { reactions, toggleReaction } = useVideoReactions();

  const requestSeek = useVideoFeedbackStore((s) => s.requestSeek);

  const [commentDraft, setCommentDraft] = useState('');

  // 현재 프로젝트의 슬라이드만 필터링
  // URL의 projectId가 "1"이면 "p1"으로 매핑
  const normalizedProjectId = projectId?.startsWith('p') ? projectId : `p${projectId}`;
  const slides = useMemo(
    () => MOCK_SLIDES.filter((slide) => slide.projectId === normalizedProjectId),
    [normalizedProjectId],
  );

  const handleAddComment = () => {
    if (!commentDraft.trim()) return;
    addComment(commentDraft);
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

  if (isLoading || slides.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full px-35 gap-6">
      <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-4">
        {/* 슬라이드 + 웹캠 + 재생바 (오버레이) */}
        <SlideWebcamStage
          slides={slides}
          slideChangeTimes={MOCK_SLIDE_CHANGE_TIMES}
          webcamVideoUrl={MOCK_VIDEO.videoUrl}
          onTimeUpdate={setCurrentTime}
        />

        {/* 대본 섹션 */}
        <ScriptSection
          slides={slides}
          slideChangeTimes={MOCK_SLIDE_CHANGE_TIMES}
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
          />
          <ReactionButtons reactions={reactions} onToggleReaction={toggleReaction} />
        </div>
      </aside>
    </div>
  );
}
