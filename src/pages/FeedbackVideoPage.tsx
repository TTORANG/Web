/**
 * @file FeedbackVideoPage.tsx
 * @description 영상 피드백 페이지
 *
 * 영상 뷰어, 타임스탬프별 댓글, 리액션을 포함합니다.
 * 구조는 FeedbackSlidePage와 동일합니다.
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import { Spinner } from '@/components/common';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import VideoViewer from '@/components/feedback/VideoViewer';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';

import { useVideoComments } from '../hooks/useVideoComments';
import { useVideoReactions } from '../hooks/useVideoReactions';

// Mock 데이터 (개발용)
const MOCK_VIDEO = {
  videoId: 'vid-1',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
  title: '테스트 영상',
  duration: 596, // BigBuckBunny는 약 596초
  feedbacks: [
    {
      timestamp: 5,
      comments: [
        {
          id: 'comment-1',
          authorId: 'user-1',
          content: '오프닝이 멋있네요!',
          timestamp: new Date().toISOString(),
          isMine: true,
          slideRef: '5초',
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 2, active: true },
        { type: 'sleepy' as const, count: 0 },
        { type: 'good' as const, count: 1 },
        { type: 'bad' as const, count: 0 },
        { type: 'confused' as const, count: 0 },
      ],
    },
    {
      timestamp: 15,
      comments: [
        {
          id: 'comment-2',
          authorId: 'user-2',
          content: '배경 음악이 좋습니다.',
          timestamp: new Date().toISOString(),
          isMine: false,
          slideRef: '15초',
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 0 },
        { type: 'sleepy' as const, count: 0 },
        { type: 'good' as const, count: 3 },
        { type: 'bad' as const, count: 0 },
        { type: 'confused' as const, count: 0 },
      ],
    },
  ],
};

export default function FeedbackVideoPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [isLoading, setIsLoading] = useState(true);

  const initVideo = useVideoFeedbackStore((state) => state.initVideo);
  const { comments, addComment, addReply, deleteComment } = useVideoComments();
  const { reactions, toggleReaction } = useVideoReactions();

  const [commentDraft, setCommentDraft] = useState('');

  const handleAddComment = () => {
    if (!commentDraft.trim()) return;
    addComment(commentDraft);
    setCommentDraft('');
  };

  // 페이지 로드 시 Mock 데이터 초기화
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
      <VideoViewer
        videoUrl="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        videoTitle="테스트 영상"
      />

      <aside className="w-96 shrink-0 bg-gray-100 flex flex-col border-l border-gray-200">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <CommentList
            comments={comments}
            onAddReply={addReply}
            onDeleteComment={deleteComment}
            onGoToSlideRef={function (ref: string): void {
              throw new Error('Function not implemented.');
            }}
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
