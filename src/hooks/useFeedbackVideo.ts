/**
 * @file useFeedbackVideo.ts
 * @description FeedbackVideoPage의 비즈니스 로직을 담당하는 커스텀 훅
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useVideoComments } from '@/hooks/useVideoComments';
import { useVideoReactions } from '@/hooks/useVideoReactions';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Comment } from '@/types/comment';
import { formatVideoTimestamp } from '@/utils/format';

export function useFeedbackVideo() {
  const { projectId } = useParams<{ projectId: string }>();
  const [isLoading, setIsLoading] = useState(true);

  // Store selectors
  const video = useVideoFeedbackStore((s) => s.video);
  const initVideo = useVideoFeedbackStore((s) => s.initVideo);
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);
  const requestSeek = useVideoFeedbackStore((s) => s.requestSeek);

  // Comments & Reactions
  const { comments, addComment, addReply, deleteComment } = useVideoComments();
  const { reactions, toggleReaction } = useVideoReactions();

  // Comment draft state
  const [commentDraft, setCommentDraft] = useState('');

  // TODO: 실제 API로 프로젝트 슬라이드 조회
  const projectSlides = useMemo(() => [], []);

  // TODO: 슬라이드 전환 시간 계산
  const slideChangeTimes = useMemo(() => [], []);

  // 타임스탬프 프리픽스 (댓글 입력 시 자동 삽입)
  const timestampPrefix = useMemo(() => `${formatVideoTimestamp(currentTime)} `, [currentTime]);

  // 댓글 추가 핸들러
  const handleAddComment = useCallback(() => {
    if (!commentDraft.trim()) return;
    addComment(commentDraft, currentTime);
    setCommentDraft('');
  }, [commentDraft, addComment, currentTime]);

  // 타임스탬프 참조로 이동
  const handleGoToTimeRef = useCallback(
    (ref: NonNullable<Comment['ref']>) => {
      if (ref.kind === 'video') requestSeek(ref.seconds);
    },
    [requestSeek],
  );

  // 비디오 초기화 - 테스트용으로 videoId=1 사용
  useEffect(() => {
    if (!projectId) return;

    // 임시: 서버에 존재하는 videoId=11을 하드코딩
    const testVideoData = {
      videoId: 11, // 서버의 실제 비디오 ID (number 타입)
      videoUrl: '/p1.webm',
      title: '테스트 영상',
      duration: 596,
      comments: [],
      reactionEvents: [],
      feedbacks: [],
    };

    // console.log('[useFeedbackVideo] Using test videoId:', testVideoData.videoId);
    initVideo(testVideoData);
    // setState를 effect에서 직접 호출하지 않고 타이머로 지연
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [projectId, initVideo]);

  return {
    // 상태
    isLoading,
    currentTime,
    projectSlides,
    slideChangeTimes,
    comments,
    reactions,
    commentDraft,
    timestampPrefix,

    // 액션
    updateCurrentTime,
    requestSeek,
    setCommentDraft,
    handleAddComment,
    handleGoToTimeRef,
    addReply,
    deleteComment,
    toggleReaction,

    // 비디오 URL
    webcamVideoUrl: video?.videoUrl || '/p1.webm',
  };
}

export type FeedbackVideoContext = ReturnType<typeof useFeedbackVideo>;
