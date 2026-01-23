// /**
//  * @file FeedbackVideoPage.tsx
//  * @description 영상 피드백 페이지
//  *
//  * 영상 뷰어, 타임스탬프별 댓글, 리액션을 포함합니다.
//  * 구조는 FeedbackSlidePage와 동일합니다.
//  */
// import { useCallback, useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { CommentInput } from '@/components/comment';
// import CommentList from '@/components/comment/CommentList';
// import { Spinner } from '@/components/common';
// import ReactionButtons from '@/components/feedback/ReactionButtons';
// import VideoViewer from '@/components/feedback/VideoViewer';
// import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
// import type { CommentRef } from '@/types/comment';
// // CHANGED: CommentRef 타입 import
// import { useVideoComments } from '../hooks/useVideoComments';
// import { useVideoReactions } from '../hooks/useVideoReactions';
// // Mock 데이터 (개발용)
// const MOCK_VIDEO = {
//   videoId: 'vid-1',
//   videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
//   title: '테스트영상',
//   duration: 596,
//   comments: [],
//   reactionEvents: [],
//   feedbacks: [
//     {
//       timestamp: 5,
//       comments: [
//         {
//           id: 'comment-1',
//           authorId: 'user-1',
//           content: '오프닝이 멋있네요!',
//           timestamp: new Date().toISOString(),
//           isMine: true,
//           videoSecondsRef: 5,
//         },
//       ],
//       reactions: [
//         { type: 'fire' as const, count: 2, active: false },
//         { type: 'sleepy' as const, count: 0, active: false },
//         { type: 'good' as const, count: 1, active: false },
//         { type: 'bad' as const, count: 0, active: false },
//         { type: 'confused' as const, count: 0, active: false },
//       ],
//     },
//     {
//       timestamp: 15,
//       comments: [
//         {
//           id: 'comment-2',
//           authorId: 'user-2',
//           content: '배경 음악이 좋습니다.',
//           timestamp: new Date().toISOString(),
//           isMine: false,
//           videoSecondsRef: 15,
//         },
//       ],
//       reactions: [
//         { type: 'fire' as const, count: 0, active: false },
//         { type: 'sleepy' as const, count: 0, active: false },
//         { type: 'good' as const, count: 3, active: false },
//         { type: 'bad' as const, count: 0, active: false },
//         { type: 'confused' as const, count: 0, active: false },
//       ],
//     },
//     {
//       timestamp: 17,
//       comments: [
//         {
//           id: 'comment-3',
//           authorId: 'user-2',
//           content: '같은 구간에서 누적이 되나 테스트합니다.',
//           timestamp: new Date().toISOString(),
//           isMine: false,
//           videoSecondsRef: 17,
//         },
//       ],
//       reactions: [
//         { type: 'fire' as const, count: 5, active: false },
//         { type: 'sleepy' as const, count: 4, active: false },
//         { type: 'good' as const, count: 3, active: false },
//         { type: 'bad' as const, count: 0, active: false },
//         { type: 'confused' as const, count: 990, active: false },
//       ],
//     },
//   ],
// };
// export default function FeedbackVideoPage() {
//   const { projectId } = useParams<{ projectId: string }>();
//   const [isLoading, setIsLoading] = useState(true);
//   const initVideo = useVideoFeedbackStore((state) => state.initVideo);
//   const { comments, addComment, addReply, deleteComment } = useVideoComments();
//   const { reactions, toggleReaction } = useVideoReactions();
//   // seek 요청 액션
//   const requestSeek = useVideoFeedbackStore((s) => s.requestSeek);
//   const [commentDraft, setCommentDraft] = useState('');
//   const handleAddComment = () => {
//     if (!commentDraft.trim()) return;
//     addComment(commentDraft);
//     setCommentDraft('');
//   };
//   // CommentList의 onGoToRef는 "슬라이드/영상"을 한 번에 받음
//   // - video면: requestSeek(seconds) 로 처리
//   const handleGoToTimeRef = useCallback(
//     (ref: CommentRef) => {
//       if (ref.kind === 'video') {
//         requestSeek(ref.seconds);
//         return;
//       }
//     },
//     [requestSeek],
//   );
//   useEffect(() => {
//     const timer = window.setTimeout(() => {
//       initVideo(MOCK_VIDEO);
//       setIsLoading(false);
//     }, 500);
//     return () => window.clearTimeout(timer);
//   }, [projectId, initVideo]);
//   if (isLoading) {
//     return (
//       <div className="flex h-full items-center justify-center bg-white">
//         <Spinner size={40} />
//       </div>
//     );
//   }
//   return (
//     <div className="flex h-full w-full px-35">
//       <VideoViewer videoUrl={MOCK_VIDEO.videoUrl} videoTitle={MOCK_VIDEO.title} />
//       <aside className="w-96 shrink-0 bg-gray-100 flex flex-col border-l border-gray-200">
//         <div className="flex-1 min-h-0 overflow-y-auto">
//           <CommentList
//             comments={comments}
//             onAddReply={addReply}
//             onGoToRef={handleGoToTimeRef} //
//             onDeleteComment={deleteComment}
//           />
//         </div>
//         <div className="shrink-0 border-t border-black/5 flex flex-col gap-6 px-4 pb-6 pt-2">
//           <CommentInput
//             value={commentDraft}
//             onChange={setCommentDraft}
//             onSubmit={handleAddComment}
//             onCancel={() => setCommentDraft('')}
//             className="items-end w-86"
//           />
//           <ReactionButtons reactions={reactions} onToggleReaction={toggleReaction} />
//         </div>
//       </aside>
//     </div>
//   );
// }
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import { Spinner } from '@/components/common';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import SlideWebcamStage from '@/components/feedback/SlideWebcamStage';
import { MOCK_SLIDES } from '@/mocks/slides';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Comment } from '@/types/comment';

import { useVideoComments } from '../hooks/useVideoComments';
import { useVideoReactions } from '../hooks/useVideoReactions';

// 웹캠 녹화본(목비디오)
const MOCK_VIDEO = {
  videoId: 'vid-1',
  videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  title: '테스트영상',
  duration: 596,
  comments: [],
  reactionEvents: [],
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
          ref: { kind: 'video' as const, seconds: 5 },
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 2, active: false },
        { type: 'sleepy' as const, count: 0, active: false },
        { type: 'good' as const, count: 1, active: false },
        { type: 'bad' as const, count: 0, active: false },
        { type: 'confused' as const, count: 0, active: false },
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
          ref: { kind: 'video' as const, seconds: 15 },
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 0, active: false },
        { type: 'sleepy' as const, count: 0, active: false },
        { type: 'good' as const, count: 3, active: false },
        { type: 'bad' as const, count: 0, active: false },
        { type: 'confused' as const, count: 0, active: false },
      ],
    },
    {
      timestamp: 17,
      comments: [
        {
          id: 'comment-3',
          authorId: 'user-2',
          content: '같은 구간에서 누적이 되나 테스트합니다.',
          timestamp: new Date().toISOString(),
          isMine: false,
          ref: { kind: 'video' as const, seconds: 17 },
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 5, active: false },
        { type: 'sleepy' as const, count: 4, active: false },
        { type: 'good' as const, count: 3, active: false },
        { type: 'bad' as const, count: 0, active: false },
        { type: 'confused' as const, count: 990, active: false },
      ],
    },
  ],
};

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
