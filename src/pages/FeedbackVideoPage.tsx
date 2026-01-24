import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import { Spinner } from '@/components/common';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import SlideWebcamStage from '@/components/feedback/SlideWebcamStage';
import { MOCK_SLIDES } from '@/mocks/slides';
import { MOCK_VIDEO } from '@/mocks/videos';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Comment } from '@/types/comment';

import { useVideoComments } from '../hooks/useVideoComments';
import { useVideoReactions } from '../hooks/useVideoReactions';

/**
 * "슬라이드 넘긴 시각(초)" 목데이터
 * - 값은 예시. 실제 녹화 데이터에 맞춰 조정하면 됨.
 */
const MOCK_SLIDE_CHANGE_TIMES = [0, 12, 24, 38, 52, 75, 96, 130, 160, 210];

export default function FeedbackVideoPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [isLoading, setIsLoading] = useState(true);

  const initVideo = useVideoFeedbackStore((state) => state.initVideo);

  const { comments, addComment, addReply, deleteComment } = useVideoComments();
  const { reactions, toggleReaction } = useVideoReactions();

  const requestSeek = useVideoFeedbackStore((s) => s.requestSeek);

  const [commentDraft, setCommentDraft] = useState('');

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
    <div className="flex h-full w-full px-35 gap-6">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* 슬라이드 + 웹캠 + 재생바 (오버레이) */}
        <SlideWebcamStage
          slides={MOCK_SLIDES}
          slideChangeTimes={MOCK_SLIDE_CHANGE_TIMES}
          webcamVideoUrl={MOCK_VIDEO.videoUrl}
        />

        {/* 6. 대본 섹션 (현재 시간 기반) */}
        <div className="flex-1 min-w-0 bg-gray-100 rounded-lg p-4 overflow-y-auto">
          {/* TODO: 대본 표시 로직 */}
        </div>
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
